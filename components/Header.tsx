"use client"
import Link from "next/link"
import { useGetIsLoggedIn, useGetAccountInfo } from "@multiversx/sdk-dapp/hooks"
import { logout } from "@multiversx/sdk-dapp/utils"
import { 
  ExtensionLoginButton, 
  WalletConnectLoginButton, 
  WebWalletLoginButton,
  LedgerLoginButton 
} from "@multiversx/sdk-dapp/UI"
import { Vote, Shield, LogOut, Wallet, Smartphone, Globe, HardDrive, Plug, Star } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "./ui/dropdown-menu"
import { useRef } from "react"

// Componente wrapper para esconder botão original e mostrar customizado
function CustomWalletButton({ 
  children, 
  icon, 
  label, 
  onClick,
  recommended = false 
}: { 
  children: React.ReactNode
  icon: React.ReactNode
  label: string
  onClick?: () => void
  recommended?: boolean
}) {
  const hiddenButtonRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    // Encontrar e clicar no botão real escondido
    const realButton = hiddenButtonRef.current?.querySelector('button')
    if (realButton) {
      realButton.click()
    }
    onClick?.()
  }

  return (
    <div className="relative">
      {/* Botão escondido do MultiversX */}
      <div 
        ref={hiddenButtonRef}
        className="absolute opacity-0 pointer-events-none -z-10"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        {children}
      </div>
      
      {/* Nosso botão customizado */}
      <DropdownMenuItem asChild>
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between cursor-pointer p-3 rounded-lg text-sm transition-colors text-left ${
            recommended ? 'bg-green-50 hover:bg-green-100 border border-green-200' : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className={recommended ? 'font-medium text-green-800' : ''}>{label}</span>
          </div>
          {recommended && (
            <Badge className="bg-green-600 text-white text-xs">
              <Star className="h-3 w-3 mr-1" />
              Recomendado
            </Badge>
          )}
        </button>
      </DropdownMenuItem>
    </div>
  )
}

export default function Header() {
  const isLoggedIn = useGetIsLoggedIn()
  const { address } = useGetAccountInfo()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChainBallotX
              </h1>
              <p className="text-xs text-muted-foreground">Votação Descentralizada</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/proposals"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Vote className="h-4 w-4" />
              <span>Propostas</span>
            </Link>
            <Link
              href="/governance"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Governança</span>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Conectado
                </Badge>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">MultiversX Devnet</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Conectar Carteira
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-3 text-gray-700">Escolha sua carteira:</p>
                    <div className="space-y-2">
                      
                      {/* Web Wallet - RECOMENDADO (sempre funciona) */}
                      <CustomWalletButton
                        icon={<Globe className="h-4 w-4 text-green-600" />}
                        label="Web Wallet"
                        recommended={true}
                      >
                        <WebWalletLoginButton callbackRoute="/proposals" />
                      </CustomWalletButton>

                      {/* xPortal Mobile */}
                      <CustomWalletButton
                        icon={<Smartphone className="h-4 w-4" />}
                        label="xPortal Mobile"
                      >
                        <WalletConnectLoginButton callbackRoute="/proposals" />
                      </CustomWalletButton>

                      {/* Extensão Browser */}
                      <CustomWalletButton
                        icon={<Plug className="h-4 w-4" />}
                        label="Extensão Browser"
                      >
                        <ExtensionLoginButton callbackRoute="/proposals" />
                      </CustomWalletButton>

                      {/* Ledger Hardware */}
                      <CustomWalletButton
                        icon={<HardDrive className="h-4 w-4" />}
                        label="Ledger Hardware"
                      >
                        <LedgerLoginButton callbackRoute="/proposals" />
                      </CustomWalletButton>

                    </div>
                    
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-xs text-gray-500 text-center">
                        💡 <strong>Web Wallet</strong> sempre funciona no navegador
                      </p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}