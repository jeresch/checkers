package gameplay

import (
	"math"

	d "github.com/MettyS/checkers/server/domain"
)

// Game TODO
type Game struct {
	Board []d.Tile

	CurrentPlayer d.GameRole // playerID
	Participants  map[string]d.GameRole
}

type moveDirection int32

const (
	forward  moveDirection = 1
	backward moveDirection = -1
)

type playerDirection int32

const (
	up   playerDirection = -1
	down playerDirection = 1
)

type moveType uint32

const (
	step moveType = iota
	jump
	invalid
)

// AddParticipant add a participant to the game
func (g *Game) AddParticipant(playerID string) (d.GameRole, error) {
	if player, exists := g.Participants[playerID]; exists {
		return player, d.Error{Message: "Player already exists (shouldn't happen with random tokens)"}
	} else if numPlayers := len(g.Participants); numPlayers < 2 {
		if numPlayers == 0 {
			player = d.PlayerWhite
			g.CurrentPlayer = d.PlayerWhite
		} else {
			player = d.PlayerBlack
		}
		g.Participants[playerID] = player
		return player, nil
	} else {
		player = d.Spectator
		g.Participants[playerID] = player
		return player, nil
	}
}

// CreateGameHandler create a new instance of a game handler
func CreateGameHandler() Game {
	game := Game{
		Board:         createDefaultBoard(),
		CurrentPlayer: d.PlayerWhite,
		Participants:  make(map[string]d.GameRole),
	}
	return game
}

func createDefaultBoard() []d.Tile {
	board := make([]d.Tile, d.BoardSize)

	for i := 0; i < 32; i++ {
		if i < 12 {
			board[i] = d.Tile(d.Black)
		} else if i < 20 {
			board[i] = d.Tile(d.NoPiece)
		} else {
			board[i] = d.Tile(d.White)
		}
	}
	return board
}

// AttemptMoves validate moves and player and update board state
func (g *Game) AttemptMoves(playerID string, moves []d.Move) error {
	playerRole, exists := g.Participants[playerID]
	if !exists {
		return d.Error{Message: "Player not registered in this match."}
	}
	if playerRole == d.Spectator {
		return d.Error{Message: "Participant is a spectator."}
	}
	if playerRole != g.CurrentPlayer {
		return d.Error{Message: "Player must wait for turn."}
	}
	pieceIndex := uint32(math.MaxUint32)
	for _, m := range moves {
		if pieceIndex != math.MaxUint32 && m.IndexFrom != uint32(pieceIndex) {
			return d.Error{Message: "Player can only move 1 piece per turn."}
		}
		_, err := g.checkMove(playerRole, m)

		if err != nil {
			return err
		}
		pieceIndex = m.IndexTo
	}

	for _, m := range moves {
		g.move(m)
	}

	g.swapCurrentPlayer()
	return nil
}

func (g *Game) swapCurrentPlayer() {
	if g.CurrentPlayer == d.PlayerWhite {
		g.CurrentPlayer = d.PlayerBlack
	} else {
		g.CurrentPlayer = d.PlayerWhite
	}
}

func (g *Game) move(m d.Move) {
	tempTile := g.Board[m.IndexTo]
	g.Board[m.IndexTo] = g.Board[m.IndexFrom]
	g.Board[m.IndexFrom] = tempTile
}

func tileIsEnemy(playerRole d.GameRole, tile d.Tile) bool {
	isWhite := playerRole == d.PlayerWhite
	if isWhite && (tile == d.Black || tile == d.BlackPromoted) {
		return true
	}
	if !isWhite && (tile == d.White || tile == d.WhitePromoted) {
		return true
	}
	return false
}

func tileIsEmpty(tile d.Tile) bool {
	return tile == d.NoPiece
}

func pieceIsPromoted(tile d.Tile) bool {
	return tile == d.WhitePromoted || tile == d.BlackPromoted
}

func isWhite(playerRole d.GameRole) bool {
	return playerRole == d.PlayerWhite
}

func isIndexWithinRow(i uint32, bottomLimit uint32) bool {
	if bottomLimit <= i && i < uint32(bottomLimit)+d.RowLength {
		return true
	}
	return false
}

func getRowOffset(playerDir playerDirection, rowIsEven bool) int32 {
	var evenOddRowOffset int32
	if playerDir == up {
		// set offset to 0 if row is even, otherwise set it to 1
		if evenOddRowOffset = 0; !rowIsEven {
			evenOddRowOffset = 1
		}
	} else {
		// set offset to -1 if row is even, otherwise set it to 0
		if evenOddRowOffset = -1; !rowIsEven {
			evenOddRowOffset = 0
		}
	}
	return evenOddRowOffset
}

func getDirection(playerRole d.GameRole) playerDirection {
	if isWhite(playerRole) {
		return up
	}
	return down
}

func isRowEven(i uint32) bool {
	return (i/d.RowLength)%2 == 1
}

func getSteps(playerDir playerDirection, indexFrom uint32, moveDir moveDirection) (int32, int32) {
	rowOffset := getRowOffset(playerDir, isRowEven(indexFrom))
	leftStep := int32(indexFrom) + (5 * int32(playerDir) * int32(moveDir)) + rowOffset
	rightStep := int32(indexFrom) + (4 * int32(playerDir) * int32(moveDir)) + rowOffset
	return leftStep, rightStep
}

func isStepValid(playerDir playerDirection, move d.Move, moveDir moveDirection) error {
	leftStep, rightStep := getSteps(playerDir, move.IndexFrom, moveDir)

	if move.IndexTo == uint32(leftStep) || move.IndexTo == uint32(rightStep) {
		return nil
	}
	return d.Error{Message: "Invalid move attempt."}
}

func getJumps(playerDir playerDirection, indexFrom uint32, moveDir moveDirection) (int32, int32) {
	leftJump := int32(indexFrom) + (9 * int32(playerDir) * int32(moveDir))
	rightJump := int32(indexFrom) + (7 * int32(playerDir) * int32(moveDir))
	return leftJump, rightJump
}

func (g *Game) isJumpValid(playerRole d.GameRole, move d.Move, moveDir moveDirection) (int32, error) {
	playerDir := getDirection(playerRole)
	leftStep, rightStep := getSteps(playerDir, move.IndexFrom, moveDir)
	leftJump, rightJump := getJumps(playerDir, move.IndexFrom, moveDir)
	if int32(move.IndexTo) == leftJump && tileIsEnemy(playerRole, g.Board[leftStep]) {
		return leftStep, nil
	}

	if int32(move.IndexTo) == rightJump && tileIsEnemy(playerRole, g.Board[rightStep]) {
		return rightStep, nil
	}

	return -1, d.Error{Message: "Invalid move attempt."}
}

func getMoveTypeAndOrientation(playerDir playerDirection, move d.Move) (moveType, moveDirection) {
	bottomStepLimitF := (int32(move.IndexFrom/d.RowLength) + int32(playerDir)) * int32(d.RowLength)
	bottomJumpLimitF := bottomStepLimitF + (int32(d.RowLength) * int32(playerDir))
	indexTo := move.IndexTo
	if isIndexWithinRow(indexTo, uint32(bottomStepLimitF)) {
		return step, forward
	} else if isIndexWithinRow(indexTo, uint32(bottomJumpLimitF)) {
		return jump, forward
	}

	bottomStepLimitB := (int32(move.IndexFrom/d.RowLength) + (int32(playerDir) * -1)) * int32(d.RowLength)
	bottomJumpLimitB := bottomStepLimitF + (int32(d.RowLength) * (int32(playerDir) * -1))
	if isIndexWithinRow(indexTo, uint32(bottomStepLimitB)) {
		return step, backward
	} else if isIndexWithinRow(indexTo, uint32(bottomJumpLimitB)) {
		return jump, backward
	}

	return invalid, forward
}

func (g *Game) checkMove(playerRole d.GameRole, move d.Move) (int32, error) {

	if move.IndexFrom > d.BoardSize || move.IndexTo > d.BoardSize ||
		move.IndexTo < 0 || move.IndexFrom < 0 {
		return -1, d.Error{Message: "Invalid Tile indices."}
	}

	fromTile := g.Board[move.IndexFrom]
	toTile := g.Board[move.IndexTo]

	if tileIsEnemy(playerRole, fromTile) || tileIsEmpty(fromTile) {
		return -1, d.Error{Message: "Player can only move their pieces."}
	}

	if !tileIsEmpty(toTile) {
		return -1, d.Error{Message: "A piece can only be moved onto an empty tile."}
	}

	playerDir := getDirection(playerRole)
	playerMoveType, moveDir := getMoveTypeAndOrientation(playerDir, move)

	if playerMoveType == invalid {
		return -1, d.Error{Message: "Invalid move attempt."}
	}

	if moveDir == backward && !pieceIsPromoted(fromTile) {
		return -1, d.Error{Message: "Only promoted pieces can move backwards."}
	}

	if playerMoveType == step {
		return -1, isStepValid(playerDir, move, moveDir)
	}

	if playerMoveType == jump {
		return g.isJumpValid(playerRole, move, moveDir)
	}

	// single step row range:
	// white, : fromIndex / 4 ) * 4 = top range exclusive
	// 			^ - 1 ) * 4 = bottom range inclusive

	// white  : specific squares
	// spot - 4 || spot - 5  :  evenOffset = 0, oddOffset = +1

	// black  : fromIndex /4 ) + 1 ) * 4 = bottom range inclusive
	//			^ + 1 ) * 4 = top range exclusive

	// black  : specfic squares
	// spot + 4 || spot + 5 : evenOffset = -1, oddOffset = 0

	return -1, nil
}
