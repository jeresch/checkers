package controller

import (
	"context"

	d "github.com/MettyS/checkers/server/domain"
	"github.com/MettyS/checkers/server/gameplay"
)

// GameList map list of all game instances, pairing a GameID with a game handler
var GameList map[string]gameplay.Game

// TODO
// d.GameStartRequest expected fields:
// GameID string - optional
func validateGameStartRequest(req d.GameStartRequest) (bool, string) {
	return true, ""
}

// d.MoveRequest expected fields:
// MoveSet []Move - required, not nil
// PlayerID string - required, not empty
// GameID string - required, not empty
func validateMoveRequest(req d.MoveRequest) error {
	if req.MoveSet == nil {
		return d.Error{Message: "Field MoveSet required."}
	} else if req.PlayerID == "" {
		return d.Error{Message: "Field PlayerID must not be empty."}
	} else if req.GameID == "" {
		return d.Error{Message: "Field GameID must not be empty."}
	}
	return nil
}

func validateGameExists(gameID string) error {
	if _, exists := GameList[gameID]; !exists {
		return d.Error{Message: "Game does not exist."}
	}
	return nil
}

// HandleMakeMoves TODO
func HandleMakeMoves(ctx context.Context, req d.MoveRequest) (d.MoveResponse, error) {
	err := validateMoveRequest(req)

	if err != nil {
		return d.MoveResponse{
			MoveSuccess: false,
			Message:     err.Error(),
		}, nil
	}

	err = validateGameExists(req.GameID)
	if err != nil {
		return d.MoveResponse{
			MoveSuccess: false,
			Message:     err.Error(),
		}, nil
	}

	if gameInstance, exists := GameList[req.GameID]; exists {
		err := gameInstance.AttemptMoves(req.PlayerID, req.MoveSet)
		if err != nil {
			return d.MoveResponse{
				MoveSuccess: false,
				Message:     err.Error(),
			}, nil
		}
	} else {

	}
	return d.MoveResponse{}, nil
}

// HandleBoardUpdateSubscription TODO
func HandleBoardUpdateSubscription(req d.BoardSubscriptionRequest) (d.BoardUpdate, error) {
	return d.BoardUpdate{}, nil
}

// HandleStartGame TODO - playerID && gameID randomize these
func HandleStartGame(req d.GameStartRequest) (d.GameStartResponse, error) {
	gameID := req.GameID
	playerID := "RandomKeyChangeThis" // TODO

	var playerRole d.GameRole
	var err error
	if gameInstance, exists := GameList[gameID]; exists {
		playerRole, err = gameInstance.AddParticipant(playerID)
	} else {
		gameID = "RandomGameIDOverwriteChangeThis" // TODO
		gameInstance = gameplay.CreateGameHandler()
		playerRole, err = gameInstance.AddParticipant(playerID)

		GameList[gameID] = gameInstance
	}

	if err != nil {
		return d.GameStartResponse{
			Message: err.Error(),
		}, nil
	}

	return d.GameStartResponse{
		GameData: d.GameStartRole{
			PlayerRole: playerRole,
			GameID:     gameID,
			PlayerID:   playerID,
		},
	}, nil
}
