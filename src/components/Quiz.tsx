import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface QuizData {
  nome: string;
  telefone: string;
}

export const Quiz = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Seja bem-vindo! 👋 Para começar, qual é o seu nome?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [step, setStep] = useState<"name" | "phone" | "webhook" | "completed">("name");
  const [quizData, setQuizData] = useState<QuizData>({ nome: "", telefone: "" });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    addMessage(userMessage, false);
    setCurrentInput("");

    // Simulate typing delay
    setTimeout(() => {
      handleBotResponse(userMessage);
    }, 1000);
  };

  const handleBotResponse = async (userInput: string) => {
    switch (step) {
      case "name":
        setQuizData((prev) => ({ ...prev, nome: userInput }));
        addMessage(
          `Prazer em conhecê-lo, ${userInput}! 😊 Agora, pode me informar seu telefone?`,
          true
        );
        setStep("phone");
        break;

      case "phone":
        setQuizData((prev) => ({ ...prev, telefone: userInput }));
        addMessage(
          "Perfeito! Agora preciso da URL do webhook do seu n8n para enviar os dados:",
          true
        );
        setStep("webhook");
        break;

      case "webhook":
        setWebhookUrl(userInput);
        addMessage(
          "Ótimo! Agora vou enviar seus dados para o n8n. Aguarde um momento...",
          true
        );
        await sendToWebhook(userInput);
        break;

      default:
        break;
    }
  };

  const sendToWebhook = async (webhookUrl: string) => {
    setIsLoading(true);
    
    try {
      const dataToSend = {
        nome: quizData.nome,
        telefone: quizData.telefone,
        timestamp: new Date().toISOString(),
        origem: "Quiz Lovable",
      };

      console.log("Enviando dados para webhook:", dataToSend);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(dataToSend),
      });

      // Como estamos usando no-cors, não podemos verificar o status da resposta
      setTimeout(() => {
        addMessage(
          `✅ Dados enviados com sucesso! Obrigado ${quizData.nome}, seus dados foram registrados em nossa planilha!`,
          true
        );
        setStep("completed");
        
        toast({
          title: "Sucesso!",
          description: "Dados enviados para o n8n com sucesso!",
        });
      }, 1500);

    } catch (error) {
      console.error("Erro ao enviar webhook:", error);
      addMessage(
        "❌ Ops! Houve um erro ao enviar os dados. Verifique a URL do webhook e tente novamente.",
        true
      );
      setStep("webhook");
      
      toast({
        title: "Erro",
        description: "Falha ao enviar dados. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setMessages([
      {
        id: 1,
        text: "Olá! Seja bem-vindo! 👋 Para começar, qual é o seu nome?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
    setStep("name");
    setQuizData({ nome: "", telefone: "" });
    setWebhookUrl("");
    setCurrentInput("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-[var(--chat-shadow)] border-2 border-border">
        <div className="bg-card rounded-t-lg p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Quiz Assistant</h3>
              <p className="text-sm text-muted-foreground">Online agora</p>
            </div>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 bg-card">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-[var(--chat-bot-bg)] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      message.isBot
                        ? "bg-[var(--chat-bot-bg)] text-card-foreground"
                        : "bg-[var(--chat-user-bg)] text-accent-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-[var(--chat-user-bg)] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--chat-bot-bg)] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="bg-[var(--chat-bot-bg)] px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-card rounded-b-lg">
          {step !== "completed" ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={
                  step === "name"
                    ? "Digite seu nome..."
                    : step === "phone"
                    ? "Digite seu telefone..."
                    : "Cole a URL do webhook do n8n..."
                }
                className="flex-1 bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="default"
                disabled={!currentInput.trim() || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <Button
              onClick={resetQuiz}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Começar Novo Quiz
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};