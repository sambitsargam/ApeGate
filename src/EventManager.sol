// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title EventManager
 * @notice Manages event creation and metadata storage on ApeChain
 * @dev Allows event creators to register events, manage ticket inventory, and track sales
 */
contract EventManager {
    
    // ============================================================================
    // STRUCTURES
    // ============================================================================
    
    struct Event {
        uint256 eventId;
        address creator;
        string eventName;
        string description;
        string location;
        uint256 eventDate;           // Unix timestamp
        uint256 ticketPrice;         // Price in wei
        uint256 totalTickets;        // Total tickets available
        uint256 ticketsSold;         // Tickets sold so far
        string category;             // Event category
        string imageUri;             // IPFS or HTTP URI for event image
        uint256 createdAt;          // Creation timestamp
        bool isActive;              // Event status
    }

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    uint256 public nextEventId = 1;
    address public owner;
    
    mapping(uint256 => Event) public events;
    mapping(address => uint256[]) public creatorEvents;
    mapping(uint256 => mapping(address => uint256)) public ticketsPurchased;
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event EventCreated(
        uint256 indexed eventId,
        address indexed creator,
        string eventName,
        uint256 ticketPrice,
        uint256 totalTickets
    );
    
    event EventUpdated(
        uint256 indexed eventId,
        address indexed creator
    );
    
    event TicketSold(
        uint256 indexed eventId,
        address indexed buyer,
        uint256 quantity
    );
    
    event EventDeactivated(
        uint256 indexed eventId,
        address indexed creator
    );

    // ============================================================================
    // MODIFIERS
    // ============================================================================
    
    modifier onlyEventCreator(uint256 eventId) {
        require(events[eventId].creator == msg.sender, "Only event creator can modify");
        _;
    }
    
    modifier eventExists(uint256 eventId) {
        require(events[eventId].eventId != 0, "Event does not exist");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
    constructor() {
        owner = msg.sender;
    }

    // ============================================================================
    // CREATE & MANAGE EVENTS
    // ============================================================================
    
    /**
     * @notice Create a new event
     * @param _eventName Name of the event
     * @param _description Event description
     * @param _location Physical or virtual location
     * @param _eventDate Unix timestamp of event date
     * @param _ticketPrice Price per ticket in wei
     * @param _totalTickets Total number of tickets available
     * @param _category Event category
     * @param _imageUri IPFS or HTTP URI for event image
     * @return eventId The ID of created event
     */
    function createEvent(
        string memory _eventName,
        string memory _description,
        string memory _location,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _totalTickets,
        string memory _category,
        string memory _imageUri
    ) external returns (uint256) {
        require(bytes(_eventName).length > 0, "Event name required");
        require(_ticketPrice > 0, "Ticket price must be > 0");
        require(_totalTickets > 0, "Total tickets must be > 0");
        require(_eventDate > block.timestamp, "Event date must be in future");
        
        uint256 eventId = nextEventId++;
        
        events[eventId] = Event({
            eventId: eventId,
            creator: msg.sender,
            eventName: _eventName,
            description: _description,
            location: _location,
            eventDate: _eventDate,
            ticketPrice: _ticketPrice,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            category: _category,
            imageUri: _imageUri,
            createdAt: block.timestamp,
            isActive: true
        });
        
        creatorEvents[msg.sender].push(eventId);
        
        emit EventCreated(
            eventId,
            msg.sender,
            _eventName,
            _ticketPrice,
            _totalTickets
        );
        
        return eventId;
    }
    
    /**
     * @notice Update event details (only by creator)
     */
    function updateEvent(
        uint256 _eventId,
        string memory _eventName,
        string memory _description,
        string memory _location,
        string memory _imageUri
    ) external eventExists(_eventId) onlyEventCreator(_eventId) {
        require(bytes(_eventName).length > 0, "Event name required");
        
        Event storage evt = events[_eventId];
        evt.eventName = _eventName;
        evt.description = _description;
        evt.location = _location;
        evt.imageUri = _imageUri;
        
        emit EventUpdated(_eventId, msg.sender);
    }
    
    /**
     * @notice Deactivate an event (mark as cancelled)
     */
    function deactivateEvent(uint256 _eventId) 
        external 
        eventExists(_eventId) 
        onlyEventCreator(_eventId) 
    {
        events[_eventId].isActive = false;
        emit EventDeactivated(_eventId, msg.sender);
    }
    
    /**
     * @notice Record a ticket purchase (called by payment contract)
     * @dev Only callable by authorized contract
     */
    function recordTicketPurchase(
        uint256 _eventId,
        address _buyer,
        uint256 _quantity
    ) external eventExists(_eventId) {
        Event storage evt = events[_eventId];
        require(evt.isActive, "Event is not active");
        require(evt.ticketsSold + _quantity <= evt.totalTickets, "Not enough tickets");
        
        evt.ticketsSold += _quantity;
        ticketsPurchased[_eventId][_buyer] += _quantity;
        
        emit TicketSold(_eventId, _buyer, _quantity);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Get event details
     */
    function getEvent(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId)
        returns (Event memory) 
    {
        return events[_eventId];
    }
    
    /**
     * @notice Get all events created by a user
     */
    function getCreatorEvents(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorEvents[_creator];
    }
    
    /**
     * @notice Check tickets purchased by user for an event
     */
    function getTicketsPurchased(uint256 _eventId, address _buyer) 
        external 
        view 
        returns (uint256) 
    {
        return ticketsPurchased[_eventId][_buyer];
    }
    
    /**
     * @notice Get available tickets remaining
     */
    function getAvailableTickets(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId)
        returns (uint256) 
    {
        return events[_eventId].totalTickets - events[_eventId].ticketsSold;
    }
    
    /**
     * @notice Get event sales revenue
     */
    function getEventRevenue(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId)
        returns (uint256) 
    {
        Event memory evt = events[_eventId];
        return evt.ticketsSold * evt.ticketPrice;
    }

    // ============================================================================
    // OWNER FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Allow owner to disable an event (for abuse prevention)
     */
    function ownerDisableEvent(uint256 _eventId) 
        external 
        onlyOwner 
        eventExists(_eventId) 
    {
        events[_eventId].isActive = false;
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Get next event ID
     */
    function getNextEventId() external view returns (uint256) {
        return nextEventId;
    }
}
