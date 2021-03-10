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
		err := g.checkMove(playerRole, m)

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

func playerOwnsTile(playerRole d.GameRole, tile d.Tile) bool {
	isWhite := playerRole == d.PlayerWhite

	if isWhite && (tile == d.White || tile == d.WhitePromoted) {
		return true
	}
	if !isWhite && (tile == d.Black || tile == d.BlackPromoted) {
		return true
	}
	return false
}

func (g *Game) checkMove(playerRole d.GameRole, move d.Move) error {

	if move.IndexFrom > uint32(d.BoardSize) || move.IndexTo > uint32(d.BoardSize) {
		return d.Error{Message: "Invalid Tile indices."}
	}

	fromTile := g.Board[move.IndexFrom]
	toTile := g.Board[move.IndexTo]

	if !playerOwnsTile(playerRole, fromTile) {
		return d.Error{Message: "Player can only move their pieces."}
	}

	if toTile != d.NoPiece {
		return d.Error{Message: "A piece can only be moved onto an empty tile."}
	}

	// ..00..01..02..03
	// 04..05..06..07..
	// ..08..09..10..11
	// 12..13..14..15..
	// ..16..17..18..19
	// 20..21..22..23..
	// ..24..25..26..27
	// 28..29..30..31..
	isWhite := playerRole == d.PlayerWhite
	rowIsEven := (move.IndexFrom/4)%2 == 1

	var evenOddOffset int32
	var topLimit, bottomLimit uint32
	var validLeftIndex, validRightIndex int32

	var topLimitJump, bottomLimitJump uint32
	var validLeftJumpIndex, validRightJumpIndex int32
	if isWhite {
		// set offset to 0 if row is even, otherwise set it to 1
		if evenOddOffset = 0; !rowIsEven {
			evenOddOffset = 1
		}

		topLimit = (move.IndexFrom / 4) * 4
		bottomLimit = ((move.IndexFrom / 4) - 1) * 4
		validLeftIndex = int32(move.IndexFrom) - 5 + evenOddOffset
		validRightIndex = int32(move.IndexFrom) - 4 + evenOddOffset

		topLimitJump = bottomLimit
		bottomLimitJump = ((move.IndexFrom / 4) - 2) * 4
		validLeftJumpIndex = int32(move.IndexFrom) - 9
		validRightJumpIndex = int32(move.IndexFrom) - 7
	} else {
		// set offset to -1 if row is even, otherwise set it to 0
		if evenOddOffset = -1; !rowIsEven {
			evenOddOffset = 0
		}

		topLimit = ((move.IndexFrom / 4) + 2) * 4
		bottomLimit = ((move.IndexFrom / 4) + 1) * 4
		validLeftIndex = int32(move.IndexFrom) + 4 + evenOddOffset
		validRightIndex = int32(move.IndexFrom) + 5 + evenOddOffset

		topLimitJump = ((move.IndexFrom / 4) + 3) * 4
		bottomLimitJump = topLimit
		validLeftJumpIndex = int32(move.IndexFrom) + 7
		validRightJumpIndex = int32(move.IndexFrom) + 9
	}

	if move.IndexTo >= bottomLimitJump && move.IndexTo < topLimitJump {
		if move.IndexTo == uint32(validLeftJumpIndex) && !playerOwnsTile(playerRole, g.Board[validLeftIndex]) &&
			g.Board[validLeftIndex] != d.NoPiece {
			return nil
		}
		if move.IndexTo == uint32(validRightJumpIndex) && !playerOwnsTile(playerRole, g.Board[validRightIndex]) &&
			g.Board[validRightIndex] != d.NoPiece {
			return nil
		}
	}

	if move.IndexTo < bottomLimit || move.IndexTo >= topLimit {
		return d.Error{Message: "Invalid move attempt"}
	}

	if move.IndexTo != uint32(validLeftIndex) && move.IndexTo != uint32(validRightIndex) {
		return d.Error{Message: "Invalid move attempt"}
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

	return nil
}
