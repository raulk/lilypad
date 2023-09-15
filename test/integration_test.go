package main

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/bacalhau-project/lilypad/pkg/executor/noop"
	"github.com/bacalhau-project/lilypad/pkg/jobcreator"
	optionsfactory "github.com/bacalhau-project/lilypad/pkg/options"
	"github.com/bacalhau-project/lilypad/pkg/resourceprovider"
	"github.com/bacalhau-project/lilypad/pkg/solver"
	solvermemorystore "github.com/bacalhau-project/lilypad/pkg/solver/store/memory"
	"github.com/bacalhau-project/lilypad/pkg/system"
	"github.com/bacalhau-project/lilypad/pkg/web3"
	"github.com/davecgh/go-spew/spew"
)

func getSolver(t *testing.T, systemContext *system.CommandContext) (*solver.Solver, error) {
	solverOptions := optionsfactory.NewSolverOptions()
	solverOptions.Web3.PrivateKey = os.Getenv("SOLVER_PRIVATE_KEY")
	solverOptions.Server.Port = 8080
	solverOptions.Server.URL = "http://localhost:8080"

	// test that the solver private key is defined
	if solverOptions.Web3.PrivateKey == "" {
		return nil, fmt.Errorf("SOLVER_PRIVATE_KEY is not defined")
	}

	web3SDK, err := web3.NewContractSDK(solverOptions.Web3)
	if err != nil {
		return nil, err
	}

	solverStore, err := solvermemorystore.NewSolverStoreMemory()
	if err != nil {
		return nil, err
	}

	return solver.NewSolver(solverOptions, solverStore, web3SDK)
}

func getResourceProvider(t *testing.T, systemContext *system.CommandContext) (*resourceprovider.ResourceProvider, error) {
	resourceProviderOptions := optionsfactory.NewResourceProviderOptions()
	resourceProviderOptions.Web3.PrivateKey = os.Getenv("RESOURCE_PROVIDER_PRIVATE_KEY")
	if resourceProviderOptions.Web3.PrivateKey == "" {
		return nil, fmt.Errorf("RESOURCE_PROVIDER_PRIVATE_KEY is not defined")
	}
	resourceProviderOptions, err := optionsfactory.ProcessResourceProviderOptions(resourceProviderOptions)
	if err != nil {
		return nil, err
	}

	web3SDK, err := web3.NewContractSDK(resourceProviderOptions.Web3)
	if err != nil {
		return nil, err
	}

	executor, err := noop.NewNoopExecutor(noop.NoopExecutorOptions{
		BadActor: false,
	})
	if err != nil {
		return nil, err
	}

	return resourceprovider.NewResourceProvider(resourceProviderOptions, web3SDK, executor)
}

func getJobCreatorOptions() (jobcreator.JobCreatorOptions, error) {
	jobCreatorOptions := optionsfactory.NewJobCreatorOptions()
	jobCreatorOptions.Web3.PrivateKey = os.Getenv("JOB_CREATOR_PRIVATE_KEY")
	if jobCreatorOptions.Web3.PrivateKey == "" {
		return jobCreatorOptions, fmt.Errorf("JOB_CREATOR_PRIVATE_KEY is not defined")
	}
	return optionsfactory.ProcessJobCreatorOptions(jobCreatorOptions, []string{
		// this should point to the shortcut
		"cowsay",
	})
}

func TestStack(t *testing.T) {
	commandCtx := system.NewTestingContext()
	defer commandCtx.Cleanup()

	solver, err := getSolver(t, commandCtx)
	if err != nil {
		t.Error(err)
		return
	}

	solver.Start(commandCtx.Ctx, commandCtx.Cm)

	// give the solver server a chance to boot before we get all the websockets
	// up and trying to connect to it
	time.Sleep(100 * time.Millisecond)

	resourceProvider, err := getResourceProvider(t, commandCtx)
	if err != nil {
		t.Error(err)
		return
	}

	jobCreatorOptions, err := getJobCreatorOptions()
	if err != nil {
		t.Error(err)
		return
	}

	resourceProvider.Start(commandCtx.Ctx, commandCtx.Cm)

	result, err := jobcreator.RunJob(commandCtx, jobCreatorOptions)

	fmt.Printf("result --------------------------------------\n")
	spew.Dump(result)
}
