package main

//go:generate bash -c "protoc --experimental_allow_proto3_optional --proto_path=../protobuf --go_out=generated/ --go-grpc_out=generated/ $(find ../protobuf -type f -name *.proto)"

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"

	gppb "github.com/MettyS/checkers/server/generated"
	"google.golang.org/grpc"
)

type server struct {
}

func (s *server) MakeMoves(ctx context.Context, req *gppb.MoveRequest) *gppb.MoveResponse {

	fmt.Println("MakeMoves Running!")

	res := &gppb.MoveResponse{
		MoveSuccess: true,
	}

	return res
}

// BoardUpdateSubscription

// rpc MakeMoves(MoveRequest) returns (MoveResponse) {}
// rpc BoardUpdateSubscription(BoardSubscriptionRequest) returns (stream BoardUpdate) {}

func main() {
	port, err := strconv.Atoi(os.Getenv("SERVER_LISTEN_PORT"))
	if err != nil {
		log.Fatalln("SERVER_LISTEN_PORT env var is required")
	}
	lis, err := net.Listen("tcp", fmt.Sprintf(":%v", port))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	checkersServer := grpc.NewServer()

	//s := server{}
	//gppb.RegisterGameplayServiceServer(checkersServer, &s)

	if err := checkersServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}
