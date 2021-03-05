package services

import (
	"context"

	controller "github.com/MettyS/checkers/server/controller"
	pb "github.com/MettyS/checkers/server/generated"
)

// GameControlServer server for game control service
type GameControlServer struct {
	pb.UnimplementedGameControlServiceServer
}

func convertGameStartRequestInward(req *pb.GameStartRequest) controller.GameStartRequest {
	domGameStartRequest := controller.GameStartRequest{}
	domGameStartRequest.GameID = req.GetGameId()
	return domGameStartRequest
}

func convertGameStartResponseOutward(req controller.GameStartResponse) *pb.GameStartResponse {
	pbGameStartResponse := pb.GameStartResponse{}
	pbGameStartResponse.Message = &req.Message

	pbGameStartResponse.GameData = &pb.GameStartRole{
		PlayerRole: pb.GameRole_SPECTATOR, // TODO
		GameId:     req.GameData.GameID,
	}
	return &pbGameStartResponse
}

// StartGame (context.Context, *GameStartRequest) (*GameStartResponse, error)
func (s *GameControlServer) StartGame(ctx context.Context, req *pb.GameStartRequest) (*pb.GameStartResponse, error) {
	domGameStartRequest := convertGameStartRequestInward(req)
	domGameStartResponse, err := controller.HandleStartGame(domGameStartRequest)
	return convertGameStartResponseOutward(domGameStartResponse), err
}
