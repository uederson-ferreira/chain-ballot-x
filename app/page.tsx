"use client"
import Link from "next/link"
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks"
import { Vote, Shield, Zap, Users, ArrowRight, CheckCircle, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const isLoggedIn = useGetIsLoggedIn()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            <Vote className="h-3 w-3 mr-1" />
            Blockchain MultiversX
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Chain Ballot X
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            O futuro da <span className="font-semibold text-foreground">votação descentralizada</span> está aqui. Vote
            em propostas de forma transparente, segura e imutável na blockchain MultiversX.
          </p>

          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Link href="/proposals">
                  <Vote className="h-5 w-5 mr-2" />
                  Ver Propostas
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                <Link href="/governance">
                  <Shield className="h-5 w-5 mr-2" />
                  Criar Proposta
                </Link>
              </Button>
            </div>
          ) : (
            <Card className="max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-amber-800">Conecte sua Carteira</CardTitle>
                <CardDescription className="text-amber-700">
                  Para começar a participar da governança descentralizada
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-amber-600 mb-4">Use o botão "Conectar Carteira" no header acima</p>
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    MultiversX Devnet
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o ChainBallotX?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construído com as melhores práticas de blockchain para garantir transparência total
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Votação Segura</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Todas as votações são registradas de forma imutável na blockchain MultiversX, garantindo transparência
                  e auditabilidade total.
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Imutável
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Descentralizado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Nenhuma autoridade central controla o sistema. O poder está nas mãos da comunidade através de
                  governança descentralizada.
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Comunidade
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Rápido & Eficiente</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Transações ultrarrápidas e taxas baixíssimas graças à arquitetura inovadora e eficiente da MultiversX.
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Instantâneo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-muted-foreground">Transparente</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">0.001s</div>
              <div className="text-sm text-muted-foreground">Tempo de Transação</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-green-600">$0.01</div>
              <div className="text-sm text-muted-foreground">Taxa Média</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}