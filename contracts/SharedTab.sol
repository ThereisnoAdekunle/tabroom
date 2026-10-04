// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title SharedTab
/// @notice A host opens a tab, contributors fund it, the host pays a vendor, and unspent balances are claimable pro-rata.
contract SharedTab {
    struct Tab {
        address host;
        address token;
        uint256 totalIn;
        uint256 totalOut;
        bool closed;
        bytes32 titleHash;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Tab) public tabs;
    mapping(uint256 => mapping(address => uint256)) public deposits;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event Opened(uint256 indexed id, address indexed host, address token, bytes32 titleHash);
    event Funded(uint256 indexed id, address indexed from, uint256 amount);
    event Spent(uint256 indexed id, address indexed vendor, uint256 amount);
    event Closed(uint256 indexed id);
    event Claimed(uint256 indexed id, address indexed contributor, uint256 amount);

    error BadToken();
    error BadAmount();
    error NotHost();
    error ClosedTab();
    error OpenTab();
    error Overspend();
    error NothingToClaim();
    error TransferFailed();

    function open(address token, bytes32 titleHash) external returns (uint256 id) {
        if (token == address(0)) revert BadToken();
        id = nextId++;
        tabs[id] = Tab({ host: msg.sender, token: token, totalIn: 0, totalOut: 0, closed: false, titleHash: titleHash });
        emit Opened(id, msg.sender, token, titleHash);
    }

    function fund(uint256 id, uint256 amount) external {
        Tab storage t = tabs[id];
        if (t.host == address(0)) revert BadToken();
        if (t.closed) revert ClosedTab();
        if (amount == 0) revert BadAmount();
        t.totalIn += amount;
        deposits[id][msg.sender] += amount;
        if (!IERC20(t.token).transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit Funded(id, msg.sender, amount);
    }

    function spend(uint256 id, address vendor, uint256 amount) external {
        Tab storage t = tabs[id];
        if (msg.sender != t.host) revert NotHost();
        if (t.closed) revert ClosedTab();
        if (vendor == address(0) || amount == 0) revert BadAmount();
        if (t.totalOut + amount > t.totalIn) revert Overspend();
        t.totalOut += amount;
        if (!IERC20(t.token).transfer(vendor, amount)) revert TransferFailed();
        emit Spent(id, vendor, amount);
    }

    function close(uint256 id) external {
        Tab storage t = tabs[id];
        if (msg.sender != t.host) revert NotHost();
        if (t.closed) revert ClosedTab();
        t.closed = true;
        emit Closed(id);
    }

    function claim(uint256 id) external {
        Tab storage t = tabs[id];
        if (!t.closed) revert OpenTab();
        if (claimed[id][msg.sender]) revert NothingToClaim();
        uint256 deposit = deposits[id][msg.sender];
        if (deposit == 0 || t.totalIn == 0) revert NothingToClaim();
        uint256 unspent = t.totalIn - t.totalOut;
        uint256 share = (deposit * unspent) / t.totalIn;
        claimed[id][msg.sender] = true;
        if (share > 0 && !IERC20(t.token).transfer(msg.sender, share)) revert TransferFailed();
        emit Claimed(id, msg.sender, share);
    }
}
