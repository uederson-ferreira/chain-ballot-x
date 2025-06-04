"use client"
import { useState, useEffect, useCallback } from "react"
import type React from "react"

import { useGetAccountInfo, useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks"
import { sendTransactions } from "@multiversx/sdk-dapp/services"
import { ContractService } from "../../services/contractService"
import {
  Shield,
  Plus,
  BarChart3,
  Users,
  Vote,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function Governance() {
  const isLoggedIn = useGetIsLoggedIn()
  const { address } = useGetAccountInfo()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("7")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({
    totalProposals: 0,
    totalVotes: 0,
    activeProposals: 0,
    participants: 0,
  })

  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x"

  const contractService = new ContractService()

  const fetchStats = useCallback(async () => {
    try {
      const contractStats = await contractService.getContractStats()
      setStats(contractStats)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }, [contractService])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn || !address) {
      alert("Você precisa estar conectado para criar uma proposta!")
      return
    }

    if (!title.trim() || !description.trim()) {
      alert("Por favor, preencha todos os campos!")
      return
    }

    if (title.length > 100) {
      alert("O título deve ter no máximo 100 caracteres!")
      return
    }

    if (description.length > 1000) {
      alert("A descrição deve ter no máximo 1000 caracteres!")
      return
    }

    setIsSubmitting(true)

    try {
      const titleHex = Buffer.from(title, "utf8").toString("hex")
      const descriptionHex = Buffer.from(description, "utf8").toString("hex")
      const durationInSeconds = Number.parseInt(duration) * 24 * 60 * 60
      const durationHex = durationInSeconds.toString(16).padStart(16, "0")

      const transaction = {
        value: "0",
        data: `create_proposal@${titleHex}@${descriptionHex}@${durationHex}`,
        receiver: contractAddress,
        gasLimit: "10000000",
        chainID: "D",
      }

      await sendTransactions({
        transactions: [transaction],
        transactionsDisplayInfo: {
          processingMessage: "Criando proposta...",
          errorMessage: "Erro ao criar proposta",
          successMessage: "Proposta criada com sucesso!",
        },
        redirectAfterSign: false,
      })

      setTitle("")
      setDescription("")
      setDuration("7")

      setTimeout(() => {
        fetchStats()
      }, 3000)
    } catch (error) {
      console.error("Erro ao criar proposta:", error)
      alert("Erro ao criar proposta. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Governança da Plataforma
            </h1>
            <p className="text-xl text-muted-foreground">Participe das decisões que moldam o futuro</p>
          </div>

          <Alert className="max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Conecte sua carteira</strong> para participar da governança e criar propostas.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Governança da Plataforma
          </h1>
          <p className="text-xl text-muted-foreground mb-6">Crie propostas e ajude a moldar o futuro da comunidade</p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário para criar proposta */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Plus className="h-5 w-5" />
                  <span>Criar Nova Proposta</span>
                </CardTitle>
                <CardDescription className="text-blue-100">Compartilhe suas ideias com a comunidade</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={createProposal} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Título da Proposta</span>
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Digite um título claro e objetivo..."
                      className="text-base"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Máximo 100 caracteres</p>
                      <Badge variant={title.length > 80 ? "destructive" : "secondary"} className="text-xs">
                        {title.length}/100
                      </Badge>
                    </div>
                    <Progress value={(title.length / 100) * 100} className="h-1" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Descrição Detalhada
                    </label>
                    <Textarea
                      id="description"
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      placeholder="Descreva sua proposta em detalhes, incluindo objetivos, benefícios e implementação..."
                      className="text-base resize-none"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Máximo 1000 caracteres</p>
                      <Badge variant={description.length > 800 ? "destructive" : "secondary"} className="text-xs">
                        {description.length}/1000
                      </Badge>
                    </div>
                    <Progress value={(description.length / 1000) * 100} className="h-1" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">
                      Duração da Votação
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 dia</SelectItem>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="7">7 dias (Recomendado)</SelectItem>
                        <SelectItem value="14">14 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Criando Proposta...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Criar Proposta
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações e estatísticas */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Estatísticas em Tempo Real</span>
                </CardTitle>
                <CardDescription>Acompanhe a atividade da comunidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalProposals}</div>
                    <div className="text-sm text-blue-700 font-medium">Total de Propostas</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">{stats.activeProposals}</div>
                    <div className="text-sm text-green-700 font-medium">Propostas Ativas</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalVotes}</div>
                    <div className="text-sm text-purple-700 font-medium">Total de Votos</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-1">{stats.participants}</div>
                    <div className="text-sm text-orange-700 font-medium">Participantes</div>
                  </div>
                </div>
                <Button onClick={fetchStats} variant="outline" className="w-full mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Estatísticas
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Como Funciona</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Criação</h4>
                    <p className="text-sm text-muted-foreground">Qualquer usuário conectado pode criar propostas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Vote className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Votação</h4>
                    <p className="text-sm text-muted-foreground">Propostas ficam abertas pelo período definido</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Transparência</h4>
                    <p className="text-sm text-muted-foreground">Todos os votos são registrados na blockchain</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Governança</h4>
                    <p className="text-sm text-muted-foreground">Comunidade decide coletivamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-800">
                  <Lightbulb className="h-5 w-5" />
                  <span>Dicas para Propostas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Seja claro e específico no título</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Explique o problema que a proposta resolve</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Inclua detalhes de implementação</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Considere o impacto na comunidade</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Forneça justificativas sólidas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
