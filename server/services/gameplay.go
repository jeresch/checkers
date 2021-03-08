package services

import (
	"context"

	"github.com/MettyS/checkers/server/controller"
	d "github.com/MettyS/checkers/server/domain"
	pb "github.com/MettyS/checkers/server/generated"
)

// GameplayServer server for gameplay service
type GameplayServer struct {
	pb.UnimplementedGameplayServiceServer
}

func convertMoveRequestInward(req *pb.MoveRequest) d.MoveRequest {
	domainMoveRequest := d.MoveRequest{}
	domainMoveRequest.MoveSet = make([]d.Move, len(req.GetMoveSet()))
	domainMoveRequest.GameID = req.GetGameId()
	domainMoveRequest.PlayerID = req.GetPlayerId()

	for _, m := range req.GetMoveSet() {
		tempMove := d.Move{
			IndexFrom: m.GetIndexFrom(),
			IndexTo:   m.GetIndexTo(),
		}
		domainMoveRequest.MoveSet = append(domainMoveRequest.MoveSet, tempMove)
	}
	return domainMoveRequest
}

func convertMoveResponseOutward(res d.MoveResponse) *pb.MoveResponse {
	pbMoveResponse := pb.MoveResponse{}
	pbMoveResponse.MoveSuccess = res.MoveSuccess
	pbMoveResponse.Message = &res.Message

	return &pbMoveResponse
}

func convertBoardSubscriptionRequestInward(req *pb.BoardSubscriptionRequest) d.BoardSubscriptionRequest {
	domainBoardSubscriptionRequest := d.BoardSubscriptionRequest{
		GameID: req.GetGameId(),
	}

	return domainBoardSubscriptionRequest
}

func convertBoardUpdateOutward(res d.BoardUpdate) *pb.BoardUpdate {
	pbBoardUpdate := pb.BoardUpdate{}

	pbBoard := pb.BoardState{
		Board: make([]pb.Tile, d.BoardSize),
	}
	for _, t := range res.BoardState.Board {
		pbBoard.Board = append(pbBoard.Board, pb.Tile(int32(t)))
	}
	pbBoardUpdate.BoardState = &pbBoard

	pbMoves := make([]*pb.Move, len(res.PrevMoveSet))
	for _, m := range res.PrevMoveSet {
		tempMove := pb.Move{
			IndexFrom: m.IndexFrom,
			IndexTo:   m.IndexTo,
		}
		pbMoves = append(pbMoves, &tempMove)
	}
	pbBoardUpdate.PrevMoveSet = pbMoves
	return &pbBoardUpdate
}

// MakeMoves (context.Context, *MoveRequest) (*MoveResponse, error)
func (s *GameplayServer) MakeMoves(ctx context.Context, req *pb.MoveRequest) (*pb.MoveResponse, error) {
	domainMoveRequest := convertMoveRequestInward(req)
	domainMoveResponse, err := controller.HandleMakeMoves(ctx, domainMoveRequest)

	if err != nil {
		return nil, err
	}

	pbMoveResponse := convertMoveResponseOutward(domainMoveResponse)
	return pbMoveResponse, nil
}

// BoardUpdateSubscription (*BoardSubscriptionRequest, GameplayService_BoardUpdateSubscriptionServer) error
func (s *GameplayServer) BoardUpdateSubscription(req *pb.BoardSubscriptionRequest, updateStream pb.GameplayService_BoardUpdateSubscriptionServer) error {
	domainBoardSubscriptionRequest := convertBoardSubscriptionRequestInward(req)
	domainBoardUpdate, err := controller.HandleBoardUpdateSubscription(domainBoardSubscriptionRequest)

	if err != nil {
		return err
	}

	pbBoardUpdate := convertBoardUpdateOutward(domainBoardUpdate)
	return updateStream.Send(pbBoardUpdate) // returns error
}
