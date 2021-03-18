package main

//go:generate bash -c "protoc --experimental_allow_proto3_optional --proto_path=../protobuf --go_out=generated/ --go-grpc_out=generated/ --go_opt=module=github.com/MettyS/checkers/server/generated --go-grpc_opt=module=github.com/MettyS/checkers/server/generated $(find ../protobuf -type f -name *.proto)"

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"

	pb "github.com/MettyS/checkers/server/generated"
	"github.com/MettyS/checkers/server/services"
	"google.golang.org/grpc"
)

type server struct {
}

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

	gpService := services.GameplayServer{}
	pb.RegisterGameplayServiceServer(checkersServer, &gpService)

	gcService := services.GameControlServer{}
	pb.RegisterGameControlServiceServer(checkersServer, &gcService)

	if err := checkersServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}
