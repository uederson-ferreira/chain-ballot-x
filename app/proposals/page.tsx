"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useGetAccountInfo, useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks"
import { sendTransactions } from "@multiversx/sdk-dapp/services"
import { ContractService } from "@/services/contractService"
import { Vote, Clock, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Proposal {
  id: number
  title: string
  description: string
  status: string
  votesFor: number
  votesAgainst: number
  creator: string
  endsAt: number
}

export default function Proposals() {
  const isLoggedIn = useGetIsLoggedIn()
  const { address } = useGetAccountInfo()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)
  const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({})
  const [votingProposal, setVotingProposal] = useState<number | null>(null)

  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x"
  const contractService = useMemo(() => new ContractService(), [])

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    try {
      console.log("🚀 Iniciando busca de propostas...")
      const proposalData = await contractService.getProposals()
      console.log("📦 Propostas recebidas:", proposalData.length)
      setProposals(proposalData)
    } catch (error) {
      console.error("❌ Erro ao buscar propostas:", error)
    } finally {
      setLoading(false)
    }
  }, [contractService])

  const checkUserVotes = useCallback(async () => {
    if (!address) return

    const votes: { [key: number]: boolean } = {}
    for (const proposal of proposals) {
      try {
        const hasVoted = await contractService.hasVoted(address, proposal.id)
        votes[proposal.id] = hasVoted
      } catch (error) {
        console.error(`Erro ao verificar voto para proposta ${proposal.id}:`, error)
        votes[proposal.id] = false
      }
    }
    setUserVotes(votes)
  }, [address, proposals, contractService])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  useEffect(() => {
    if (isLoggedIn && address && proposals.length > 0) {
      checkUserVotes()
    }
  }, [isLoggedIn, address, proposals, checkUserVotes])

  const vote = async (proposalId: number) => {
    if (!isLoggedIn || !address) {
      alert("Você precisa estar conectado para votar!")
      return
    }

    if (userVotes[proposalId]) {
      alert("Você já votou nesta proposta!")
      return
    }

    setVotingProposal(proposalId)

    try {
      const transaction = {
        value: "0",
        data: `vote@${proposalId.toString(16).padStart(16, "0")}`,
        receiver: contractAddress,
        gasLimit: "6000000",
        chainID: "D",
      }

      await sendTransactions({
        transactions: [transaction],
        transactionsDisplayInfo: {
          processingMessage: "Processando voto...",
          errorMessage: "Erro ao votar",
          successMessage: `Voto enviado com sucesso para a proposta ${proposalId}!`,
        },
        redirectAfterSign: false,
      })

      setTimeout(() => {
        fetchProposals()
        checkUserVotes()
      }, 3000)
    } catch (error) {
      console.error("Erro ao votar:", error)
      alert("Erro ao enviar voto. Tente novamente.")
    } finally {
      setVotingProposal(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (endsAt: number) => {
    return Date.now() > endsAt
  }

  const getStatusBadge = (proposal: Proposal) => {
    const expired = isExpired(proposal.endsAt)

    if (expired) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expirada
        </Badge>
      )
    }

    if (proposal.status === "Aberta") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativa
        </Badge>
      )
    }

    return <Badge variant="secondary">{proposal.status}</Badge>
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Propostas de Governança
            </h1>
            <p className="text-xl text-muted-foreground">Participe das decisões da comunidade</p>
          </div>

          <Alert className="max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Conecte sua carteira</strong> para visualizar e votar nas propostas da comunidade.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Propostas de Governança
          </h1>
          <p className="text-xl text-muted-foreground mb-6">Vote nas propostas que moldarão o futuro da plataforma</p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Carteira Conectada</p>
                  <p className="text-sm text-muted-foreground">
                    {address.slice(0, 10)}...{address.slice(-8)}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                MultiversX Devnet
              </Badge>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-muted-foreground">Carregando propostas...</p>
          </div>
        ) : proposals.length > 0 ? (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                          {proposal.title}
                        </CardTitle>
                        {getStatusBadge(proposal)}
                      </div>
                      <CardDescription className="text-base leading-relaxed">{proposal.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Vote className="h-4 w-4" />
                      <span className="font-medium">{proposal.votesFor} votos</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{proposal.creator.slice(0, 10)}...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Termina em {formatDate(proposal.endsAt)}</span>
                    </div>
                  </div>
                </CardHeader>

                {proposal.status === "Aberta" && !isExpired(proposal.endsAt) && (
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      {userVotes[proposal.id] ? (
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Você já votou nesta proposta</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Sua participação é importante para a comunidade
                          </p>
                          <Button
                            onClick={() => vote(proposal.id)}
                            disabled={votingProposal === proposal.id}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {votingProposal === proposal.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Votando...
                              </>
                            ) : (
                              <>
                                <Vote className="h-4 w-4 mr-2" />
                                Votar Agora
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma proposta disponível</h3>
            <p className="text-muted-foreground mb-6">Seja o primeiro a criar uma proposta para a comunidade!</p>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <a href="/governance">Criar Proposta</a>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
