package services

import (
	"context"

	controller "github.com/MettyS/checkers/server/controller"
	pb "github.com/MettyS/checkers/server/generated"
)

// GameplayServer server for gameplay service
type GameplayServer struct {
	pb.UnimplementedGameplayServiceServer
}

func convertMoveRequestInward(req *pb.MoveRequest) controller.MoveRequest {
	domMoveRequest := controller.MoveRequest{}
	domMoveRequest.MoveSet = make([]controller.Move, len(req.GetMoveSet()))

	for _, m := range req.GetMoveSet() {
		tempMove := controller.Move{
			IndexFrom: m.GetIndexFrom(),
			IndexTo:   m.GetIndexTo(),
		}
		domMoveRequest.MoveSet = append(domMoveRequest.MoveSet, tempMove)
	}
	return domMoveRequest
}

func convertMoveResponseOutward(res controller.MoveResponse) *pb.MoveResponse {
	pbMoveResponse := pb.MoveResponse{}
	pbMoveResponse.MoveSuccess = res.MoveSuccess
	pbMoveResponse.Message = &res.Message

	return &pbMoveResponse
}

func convertBoardSubscriptionRequestInward(req *pb.BoardSubscriptionRequest) controller.BoardSubscriptionRequest {
	domBoardSubscriptionRequest := controller.BoardSubscriptionRequest{
		GameID: req.GetGameId(),
	}

	return domBoardSubscriptionRequest
}

func convertBoardUpdateOutward(res controller.BoardUpdate) *pb.BoardUpdate {
	pbBoardUpdate := pb.BoardUpdate{}

	pbBoard := pb.BoardState{
		Board: make([]pb.Tile, controller.BoardSize),
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
	domMoveRequest := convertMoveRequestInward(req)
	domMoveResponse, err := controller.HandleMakeMoves(ctx, domMoveRequest)

	if err != nil {
		return nil, err
	}

	pbMoveResponse := convertMoveResponseOutward(domMoveResponse)
	return pbMoveResponse, nil
}

// BoardUpdateSubscription (*BoardSubscriptionRequest, GameplayService_BoardUpdateSubscriptionServer) error
func (s *GameplayServer) BoardUpdateSubscription(req *pb.BoardSubscriptionRequest, updateStream pb.GameplayService_BoardUpdateSubscriptionServer) error {
	domBoardSubscriptionRequest := convertBoardSubscriptionRequestInward(req)
	domBoardUpdate, err := controller.HandleBoardUpdateSubscription(domBoardSubscriptionRequest)

	if err != nil {
		return err
	}

	pbBoardUpdate := convertBoardUpdateOutward(domBoardUpdate)
	return updateStream.Send(pbBoardUpdate) // returns error
}
