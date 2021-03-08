package domain

// Error domain-level error definition
type Error struct {
	Message string
}

// Error interface required method to implement custom error
func (d Error) Error() string {
	return d.Message
}

// BoardSize the size/length of playable board squares stored linearly
const BoardSize int32 = 32

// Tile typedef for Tile enumeration
type Tile int32

// Tile enumeration for representing the checker board squares contents
const (
	NoPiece Tile = iota
	White
	Black
	WhitePromoted
	BlackPromoted
)

// Move a piece 'move' containing current location and requested destination
type Move struct {
	IndexFrom uint32
	IndexTo   uint32
}

// BoardState current state of the board represented by a slice of Tiles
type BoardState struct {
	Board []Tile
}

// BoardSubscriptionRequest incomming request to join a game
type BoardSubscriptionRequest struct {
	GameID string
}

// MoveRequest incomming request to make one or more consecutive moves
type MoveRequest struct {
	MoveSet  []Move
	PlayerID string
	GameID   string
}

// MoveResponse outgoing response with MoveSuccess indicator and optional Message
type MoveResponse struct {
	MoveSuccess bool
	Message     string
}

// BoardUpdate update state of board comprised of current state and previous move
type BoardUpdate struct {
	BoardState  BoardState
	PrevMoveSet []Move
}

// GameRole type definition for GameRole enumeration
type GameRole int32

// GameRole enumeration to represent a player's role in game
const (
	PlayerWhite GameRole = iota
	PlayerBlack
	Spectator
)

// GameStartRequest incoming request to join and start a game
type GameStartRequest struct {
	GameID string
}

// GameStartRole user role information represented by GameRole and paired with GameID
type GameStartRole struct {
	PlayerRole GameRole
	GameID     string
	PlayerID   string
}

// GameStartResponse outgoing response of gamestart with user's role and optional message
type GameStartResponse struct {
	GameData GameStartRole
	Message  string
}
