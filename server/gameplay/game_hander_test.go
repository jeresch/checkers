package gameplay

import (
	"fmt"
	"math"
	"testing"
	"unicode"

	d "github.com/MettyS/checkers/server/domain"
)

func playersFixture() map[string]d.GameRole {
	return map[string]d.GameRole{
		"player1": d.PlayerWhite,
		"player2": d.PlayerBlack,
		"player3": d.Spectator,
	}
}

func createBoardFromString(s string) []d.Tile {
	board := []d.Tile{}
	sRunes := []rune(s)
	for i := 0; i < len(s); i++ {
		if !unicode.IsSpace(sRunes[i]) {
			if sRunes[i] == 'e' {
				board = append(board, d.NoPiece)
			} else if sRunes[i+1] == 'b' {
				if sRunes[i] == 'p' {
					board = append(board, d.BlackPromoted)
				} else {
					board = append(board, d.Black)
				}
			} else if sRunes[i+1] == 'w' {
				if sRunes[i] == 'p' {
					board = append(board, d.WhitePromoted)
				} else {
					board = append(board, d.White)
				}
			}
			i++
		}
	}
	return board
}

func gameWithPlayersFixture() Game {
	game := Game{}
	board := (`
    ..bb..bb..bb..bb
    bb..bb..bb..bb..
    ..bb..bb..bb..bb
    ee..ee..ee..ee..
    ..ee..ee..ee..ee
    ww..ww..ww..ww..
    ..ww..ww..ww..ww
    ww..ww..ww..ww..`)
	game.Board = createBoardFromString(board)
	game.CurrentPlayer = d.PlayerWhite
	game.Participants = playersFixture()
	return game
}

func gameWithBlackTurn() Game {
	game := Game{}
	board := (`
    ..bb..bb..bb..bb
    bb..bb..bb..bb..
    ..bb..bb..bb..bb
    ee..ee..ee..ee..
    ..ee..ee..ww..ee
    ww..ww..ee..ww..
    ..ww..ww..ww..ww
    ww..ww..ww..ww..`)
	game.Board = createBoardFromString(board)
	game.CurrentPlayer = d.PlayerBlack
	game.Participants = playersFixture()
	return game
}

func (g Game) String() string {
	return fmt.Sprintf("Board: %v\nCurrent player: %v \nParticipants: %v\n", g.Board, g.CurrentPlayer, g.Participants)
}

func getTileString(tile d.Tile) string {
	if tile == d.White {
		return "ww"
	} else if tile == d.Black {
		return "bb"
	} else if tile == d.WhitePromoted {
		return "pw"
	} else if tile == d.BlackPromoted {
		return "pb"
	} else {
		return "ee"
	}
}

type addParticipantTest struct {
	testname     string
	player       string
	expectedRole d.GameRole
	expectedErr  error
}

func TestGameSetup(t *testing.T) {
	game := CreateGameHandler()
	var addPlayerTests = []addParticipantTest{
		{"Add unique playerID1",
			"player1", d.PlayerWhite, nil},
		{"Add unique playerID2", "player2", d.PlayerBlack, nil},
		{"Add unique playerID3", "player3", d.Spectator, nil},
		{"Don't add repeat playerID1", "player1", d.PlayerWhite,
			d.Error{Message: "Player already exists (shouldn't happen with random tokens)"},
		},
		{"Add unique playerID4", "player4", d.Spectator, nil},
	}

	for _, addPlayerTest := range addPlayerTests {
		testname := addPlayerTest.testname
		t.Run(testname, func(t *testing.T) {
			resultRole, resultError := game.AddParticipant(addPlayerTest.player)

			if addPlayerTest.expectedRole != resultRole || addPlayerTest.expectedErr != resultError {
				t.Errorf("\nFailure - \nRecieved Role: %v , Error: %v\nExpected : Role: %v , Error: %v",
					resultRole, resultError, addPlayerTest.expectedRole, addPlayerTest.expectedErr)
			}
		})
	}
}

func buildMoveSet(nums []int) []d.Move {
	moves := make([]d.Move, 0)
	var indexFrom, indexTo uint32 = uint32(math.MaxUint32), uint32(math.MaxUint32)
	for i, num := range nums {
		if i%2 == 0 {
			indexFrom = uint32(num)
		} else {
			indexTo = uint32(num)
			moves = append(moves, d.Move{IndexFrom: indexFrom, IndexTo: indexTo})
		}
	}
	return moves
}

type moveset []d.Move

// ..00..01..02..03
// 04..05..06..07..
// ..08..09..10..11
// 12..13..14..15..
// ..16..17..18..19
// 20..21..22..23..
// ..24..25..26..27
// 28..29..30..31..
func TestAttemptMovesWhite(t *testing.T) {
	var playerMoveTests = []struct {
		testname          string
		player            string
		moveSet           moveset
		expectedErrExists bool
	}{
		{"Non-current player cannot make move.",
			"player2", buildMoveSet([]int{22, 17}), true}, //d.Error{Message: "Player must wait for turn."}},
		{"Spectator cannot make move.",
			"player3", buildMoveSet([]int{1000, 1000}), true}, //d.Error{Message: "Participant is a spectator."}},
		{"Non-existent player cannot make move", "player8", buildMoveSet([]int{21, 17}), true},
		{"Pieces can only be moved to empty tiles.",
			"player1", buildMoveSet([]int{26, 23}), true}, //d.Error{Message: "A piece can only be moved onto an empty tile."}},
		{"Pieces can only be moved to empty tiles.",
			"player1", buildMoveSet([]int{22, 10}), true}, // d.Error{Message: "A piece can only be moved onto an empty tile."}},
		{"PlayerWhite can only move 1 piece per turn.",
			"player1", buildMoveSet([]int{23, 18, 20, 16}), true}, //d.Error{Message: "Player can only move 1 piece per turn."}},
		{"PlayerWhite cannot move other's pieces.", "player1", buildMoveSet([]int{14, 9}), true},  //d.Error{Message: "Player can only move their pieces."}},
		{"PlayerWhite can only make a valid move.", "player1", buildMoveSet([]int{20, 19}), true}, // d.Error{Message: "Invalid move attempt"}},
		{"PlayerWhite can only make a valid move.", "player1", buildMoveSet([]int{21, 18}), true},
		{"PlayerWhite can only make a valid move.", "player1", buildMoveSet([]int{22, 13}), true},
		{"PlayerWhite can make a move.", "player1", buildMoveSet([]int{22, 18}), false},
		{"PlayerWhite can make a move.", "player1", buildMoveSet([]int{20, 16}), false},
		{"PlayerWhite can make a move.", "player1", buildMoveSet([]int{23, 19}), false},
	}

	var game Game
	for _, playerMoveTest := range playerMoveTests {
		// get fresh game fixture before each test
		game = gameWithPlayersFixture()
		t.Run(playerMoveTest.testname, func(t *testing.T) {
			resultError := game.AttemptMoves(playerMoveTest.player, playerMoveTest.moveSet)

			if !playerMoveTest.expectedErrExists != (resultError == nil) {
				t.Errorf("\n%v\n%v\nFailure - Input: %v\nRecieved Error: %v\nExpected : Error exists?: %v",
					game.String(), boardString(game), playerMoveTest.moveSet, resultError, playerMoveTest.expectedErrExists)
			}
		})
	}
}

func TestAttemptMovesBlack(t *testing.T) {
	var playerMoveTests = []struct {
		testname          string
		player            string
		moveSet           moveset
		expectedErrExists bool
	}{
		{"Non-current player cannot make move.", "player1", buildMoveSet([]int{21, 16}), true},
		{"Non-existent player cannot make move.", "player8", buildMoveSet([]int{9, 14}), true},
		{"Spectator cannot make move.", "player3", buildMoveSet([]int{9, 14}), true},
		{"Pieces can only be moved to empty tiles.", "player2", buildMoveSet([]int{9, 21}), true},
		{"Pieces can only be moved to empty tiles.", "player2", buildMoveSet([]int{2, 7}), true},
		{"PlayerBlack cannot move other's pieces.", "player2", buildMoveSet([]int{15, 19}), true},
		{"PlayerBlack cannot move other's pieces.", "player2", buildMoveSet([]int{18, 22}), true},
		{"PlayerBlack can only move 1 piece per turn.", "player2", buildMoveSet([]int{10, 14, 9, 13}), true},
		{"PlayerBlack can only make a valid move.", "player2", buildMoveSet([]int{11, 12}), true},
		{"PlayerBlack can only make a valid move.", "player2", buildMoveSet([]int{9, 16}), true},
		{"PlayerBlack can make a move.", "player2", buildMoveSet([]int{9, 14}), false},
		{"PlayerBlack can make a move.", "player2", buildMoveSet([]int{8, 12}), false},
		{"PlayerBlack can make a move.", "player2", buildMoveSet([]int{11, 15}), false},
	}

	var game Game
	for _, playerMoveTest := range playerMoveTests {
		game = gameWithBlackTurn()
		t.Run(playerMoveTest.testname, func(t *testing.T) {
			resultError := game.AttemptMoves(playerMoveTest.player, playerMoveTest.moveSet)

			if !playerMoveTest.expectedErrExists != (resultError == nil) {
				t.Errorf("\n%v\n%v\nFailure - Input: %v\nRecieved Error: %v\nExpected : Error exists?: %v",
					game.String(), boardString(game), playerMoveTest.moveSet, resultError, playerMoveTest.expectedErrExists)
			}
		})
	}
}

func TestCurrentPlayerRotation(t *testing.T) {
	var playerMoveTests = []struct {
		testname          string
		player            string
		moveSet           moveset
		expectedErrExists bool
	}{
		{"PlayerWhite can make a move.", "player1", buildMoveSet([]int{23, 19}), false},
		{"PlayerWhite cannot make a move right after their turn.", "player1", buildMoveSet([]int{19, 15}), true},
		{"PlayerBlack can make a move.", "player2", buildMoveSet([]int{11, 15}), false},
		{"PlayerBlack cannot make a move right after their turn.", "player2", buildMoveSet([]int{15, 18}), true},
		{"PlayerWhite can only make valid moves.", "player1", buildMoveSet([]int{25, 23}), true},
		{"PlayerWhite can move to a now vacated tile.", "player1", buildMoveSet([]int{27, 23}), false},
		{"PlayerBlack can only make valid moves.", "player2", buildMoveSet([]int{6, 11}), true},
		{"PlayerBlack can move to a now vacated tile.", "player2", buildMoveSet([]int{7, 11}), false},
		{"PlayerWhite cannot move a piece backwards.", "player1", buildMoveSet([]int{23, 27}), true},
		{"PlayerWhite can only make valid moves.", "player1", buildMoveSet([]int{28, 27}), true},
		{"PlayerWhite can make a move.", "player1", buildMoveSet([]int{20, 16}), false},
		{"PlayerBlack cannot move a piece backwards.", "player2", buildMoveSet([]int{11, 7}), true},
		{"PlayerBlack can only make valid moves.", "player2", buildMoveSet([]int{1, 7}), true},
	}

	var game Game = gameWithPlayersFixture()
	for _, playerMoveTest := range playerMoveTests {
		t.Run(playerMoveTest.testname, func(t *testing.T) {
			resultError := game.AttemptMoves(playerMoveTest.player, playerMoveTest.moveSet)

			if !playerMoveTest.expectedErrExists != (resultError == nil) {
				t.Errorf("\n%v\n%v\nFailure - Input: %v\nRecieved Error: %v\nExpected : Error exists?: %v",
					game.String(), boardString(game), playerMoveTest.moveSet, resultError, playerMoveTest.expectedErrExists)
			}
		})
	}
}

func boardString(game Game) string {
	result := ""
	for i, tile := range game.Board {
		tileString := getTileString(tile)

		if i%4 == 0 {
			result += fmt.Sprintf("\n")
		}

		if (i/4)%2 == 0 {
			result += fmt.Sprintf("..%v", tileString)
		} else {
			result += fmt.Sprintf("%v..", tileString)
		}
	}
	result += fmt.Sprintf("\n")
	return result
}
