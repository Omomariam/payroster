// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PayRoster
/// @notice Native BOT payroll configuration and batch settlement for small teams.
contract PayRoster {
    struct PayrollConfig {
        string name;
        string role;
        uint256 salary;
        uint64 nextPaymentAt;
        uint32 interval;
        bool active;
    }

    address public owner;
    bool private locked;
    mapping(address => PayrollConfig) public payrolls;
    address[] private employeeList;
    mapping(address => bool) private knownEmployee;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PayrollConfigured(address indexed employee, string name, string role, uint256 salary, uint64 nextPaymentAt, uint32 interval);
    event PayrollRemoved(address indexed employee);
    event PaymentSent(address indexed employee, uint256 amount, uint256 paidAt);
    event BatchPaymentCompleted(bytes32 indexed batchId, uint256 recipientCount, uint256 totalAmount);
    event FundsDeposited(address indexed sender, uint256 amount);

    error Unauthorized();
    error InvalidAddress();
    error InvalidConfiguration();
    error InvalidBatch();
    error IncorrectValue(uint256 expected, uint256 received);
    error TransferFailed(address recipient);
    error ReentrantCall();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert InvalidAddress();
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function configurePayroll(
        address employee,
        string calldata name,
        string calldata role,
        uint256 salary,
        uint64 nextPaymentAt,
        uint32 interval
    ) external onlyOwner {
        if (employee == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0 || salary == 0 || interval == 0) revert InvalidConfiguration();

        if (!knownEmployee[employee]) {
            knownEmployee[employee] = true;
            employeeList.push(employee);
        }

        payrolls[employee] = PayrollConfig({
            name: name,
            role: role,
            salary: salary,
            nextPaymentAt: nextPaymentAt,
            interval: interval,
            active: true
        });
        emit PayrollConfigured(employee, name, role, salary, nextPaymentAt, interval);
    }

    function getEmployees() external view returns (address[] memory) {
        return employeeList;
    }

    function removePayroll(address employee) external onlyOwner {
        if (!payrolls[employee].active) revert InvalidConfiguration();
        delete payrolls[employee];
        emit PayrollRemoved(employee);
    }

    /// @notice Pays configured salaries from the contract balance.
    function runPayroll(address payable[] calldata employees)
        external
        onlyOwner
        nonReentrant
        returns (bytes32 batchId)
    {
        uint256 count = employees.length;
        if (count == 0) revert InvalidBatch();

        uint256 total;
        for (uint256 i; i < count; ++i) {
            for (uint256 j; j < i; ++j) {
                if (employees[i] == employees[j]) revert InvalidBatch();
            }
            PayrollConfig memory config = payrolls[employees[i]];
            if (!config.active || block.timestamp < config.nextPaymentAt) revert InvalidConfiguration();
            total += config.salary;
        }
        if (address(this).balance < total) revert IncorrectValue(total, address(this).balance);

        batchId = keccak256(abi.encode(block.chainid, address(this), block.number, employees, total));
        for (uint256 i; i < count; ++i) {
            address payable employee = employees[i];
            PayrollConfig storage config = payrolls[employee];
            uint256 salary = config.salary;
            config.nextPaymentAt += config.interval;

            (bool sent,) = employee.call{value: salary}("");
            if (!sent) revert TransferFailed(employee);
            emit PaymentSent(employee, salary, block.timestamp);
        }
        emit BatchPaymentCompleted(batchId, count, total);
    }

    /// @notice Makes an ad-hoc batch payment funded by this transaction.
    function batchPay(address payable[] calldata recipients, uint256[] calldata amounts)
        external
        payable
        onlyOwner
        nonReentrant
        returns (bytes32 batchId)
    {
        uint256 count = recipients.length;
        if (count == 0 || count != amounts.length) revert InvalidBatch();

        uint256 total;
        for (uint256 i; i < count; ++i) {
            if (recipients[i] == address(0) || amounts[i] == 0) revert InvalidBatch();
            total += amounts[i];
        }
        if (msg.value != total) revert IncorrectValue(total, msg.value);

        batchId = keccak256(abi.encode(block.chainid, address(this), block.number, recipients, amounts));
        for (uint256 i; i < count; ++i) {
            (bool sent,) = recipients[i].call{value: amounts[i]}("");
            if (!sent) revert TransferFailed(recipients[i]);
            emit PaymentSent(recipients[i], amounts[i], block.timestamp);
        }
        emit BatchPaymentCompleted(batchId, count, total);
    }
}
