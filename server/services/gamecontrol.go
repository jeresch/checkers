package services

import (
	"context"

	"github.com/MettyS/checkers/server/controller"
	d "github.com/MettyS/checkers/server/domain"
	pb "github.com/MettyS/checkers/server/generated"
)

// GameControlServer server for game control service
type GameControlServer struct {
	pb.UnimplementedGameControlServiceServer
}

func convertGameStartRequestInward(req *pb.GameStartRequest) d.GameStartRequest {
	domainGameStartRequest := d.GameStartRequest{}
	domainGameStartRequest.GameID = req.GetGameId()
	return domainGameStartRequest
}

func convertGameStartResponseOutward(req d.GameStartResponse) *pb.GameStartResponse {
	pbGameStartResponse := pb.GameStartResponse{}
	pbGameStartResponse.Message = &req.Message

	pbGameStartResponse.GameData = &pb.GameStartRole{
		PlayerRole: pb.GameRole_SPECTATOR, // TODO
		GameId:     req.GameData.GameID,
		PlayerId:   req.GameData.PlayerID,
	}
	return &pbGameStartResponse
}

// StartGame (context.Context, *GameStartRequest) (*GameStartResponse, error)
func (s *GameControlServer) StartGame(ctx context.Context, req *pb.GameStartRequest) (*pb.GameStartResponse, error) {
	domainGameStartRequest := convertGameStartRequestInward(req)
	domainGameStartResponse, err := controller.HandleStartGame(domainGameStartRequest)
	return convertGameStartResponseOutward(domainGameStartResponse), err
}
