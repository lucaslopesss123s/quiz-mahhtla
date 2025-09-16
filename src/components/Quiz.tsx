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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [step, setStep] = useState<"welcome" | "name" | "phone" | "completed">("welcome");
  const [quizData, setQuizData] = useState<QuizData>({ nome: "", telefone: "" });
  const webhookUrl = "https://n8n.lockpainel.shop/webhook/mahhtla";
  const [isLoading, setIsLoading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Inicializar o chat com animação
  useEffect(() => {
    const initializeChat = async () => {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addMessage("Seja bem-vindo ao CF, para entrar no nosso grupo, responda as perguntas abaixo:", true);
      setIsTyping(false);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addMessage("Você já frequenta a academia?", true);
      setIsTyping(false);
      setShowButtons(true);
    };

    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (step === "phone") {
      // Aplica a máscara apenas para o campo de telefone
      const formattedValue = formatPhoneNumber(value);
      setCurrentInput(formattedValue);
    } else {
      setCurrentInput(value);
    }
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

  const handleButtonClick = async (response: string) => {
    addMessage(response, false);
    setShowButtons(false);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addMessage("Perfeito! Agora preciso do seu nome:", true);
    setIsTyping(false);
    setStep("name");
  };

  const handleBotResponse = async (userInput: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (step) {
      case "name":
        setQuizData((prev) => ({ ...prev, nome: userInput }));
        addMessage(
          `✅ Prazer em te conhecer, ${userInput}! Me informar seu telefone abaixo para te adicionar no grupo:`,
          true
        );
        setStep("phone");
        break;

      case "phone":
        // Remove formatação do telefone antes de salvar
        const telefoneOriginal = userInput.replace(/\D/g, '');
        console.log("Salvando telefone:", telefoneOriginal);
        
        // Atualiza o estado e envia os dados
        const dadosAtualizados = { ...quizData, telefone: telefoneOriginal };
        setQuizData(dadosAtualizados);
        
        addMessage(
          "✅ Perfeito! Aguarde um momento vou te enviar o link do grupo.",
          true
        );
        
        // Envia os dados usando os valores atualizados diretamente
        await sendToWebhookWithData(dadosAtualizados);
        break;

      default:
        break;
    }
    
    setIsTyping(false);
  };

  const sendToWebhookWithData = async (dados: QuizData) => {
    setIsLoading(true);
    
    try {
      // Debug: verificar dados coletados
      console.log("Dados coletados:", dados);
      console.log("Nome:", dados.nome);
      console.log("Telefone:", dados.telefone);
      
      const formData = new FormData();
      formData.append('form_field-name', dados.nome);
      formData.append('form_field-whatsapp', dados.telefone);
      formData.append('form_id', '693eed7');
      formData.append('form_name', 'New Form');

      console.log("Enviando dados para webhook:", {
        'form_field-name': dados.nome,
        'form_field-whatsapp': dados.telefone,
        'form_id': '693eed7',
        'form_name': 'New Form'
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
          setTimeout(() => {
            setStep("completed");
            setIsLoading(false);
            
            toast({
              title: "Sucesso!",
              description: "Dados enviados para o n8n com sucesso!",
            });
          }, 1500);
        } else {
         console.error('Erro na resposta:', response.status, response.statusText);
         addMessage(
           `❌ Erro ao enviar dados. Status: ${response.status}. Tente novamente.`,
           true
         );
         setIsLoading(false);
       }

     } catch (error) {
       console.error("Erro ao enviar dados:", error);
       addMessage(
         "❌ Erro ao enviar dados. Verifique sua conexão e tente novamente.",
         true
       );
       setIsLoading(false);
       
       toast({
         title: "Erro!",
         description: "Falha ao enviar dados para o n8n.",
         variant: "destructive",
       });
     }
   };

  const sendToWebhook = async () => {
    setIsLoading(true);
    
    try {
      // Debug: verificar dados coletados
      console.log("Dados coletados:", quizData);
      console.log("Nome:", quizData.nome);
      console.log("Telefone:", quizData.telefone);
      
      const formData = new FormData();
      formData.append('form_field-name', quizData.nome);
      formData.append('form_field-whatsapp', quizData.telefone);
      formData.append('form_id', '693eed7');
      formData.append('form_name', 'New Form');

      console.log("Enviando dados para webhook:", {
        'form_field-name': quizData.nome,
        'form_field-whatsapp': quizData.telefone,
        'form_id': '693eed7',
        'form_name': 'New Form'
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
         setTimeout(() => {
           addMessage(
             `✅ Dados enviados com sucesso! Obrigado ${quizData.nome}, seus dados foram registrados em nossa planilha!`,
             true
           );
           setStep("completed");
           setIsLoading(false);
           
           toast({
             title: "Sucesso!",
             description: "Dados enviados para o n8n com sucesso!",
           });
         }, 1500);
       } else {
         console.error('Erro na resposta:', response.status, response.statusText);
         addMessage(
           `❌ Erro ao enviar dados. Status: ${response.status}. Tente novamente.`,
           true
         );
         setIsLoading(false);
       }

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
    // Redirecionar para o grupo do WhatsApp
    window.open("https://chat.whatsapp.com/KRsXK9gg0d3BQdBd8RM9Yh", "_blank");
    
    setMessages([
      {
        id: 1,
        text: "Seja bem-vindo ao CF, para entrar no nosso grupo, responda as perguntas abaixo:",
        isBot: true,
        timestamp: new Date(),
      },
      {
        id: 2,
        text: "Você já frequenta a academia?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
    setStep("welcome");
    setQuizData({ nome: "", telefone: "" });
    setCurrentInput("");
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-900 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img src="/profile-image.jpeg" alt="Assistente" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Atendente do Mahhtla</h3>
              <p className="text-sm text-white/80">Online agora</p>
            </div>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 bg-gray-900">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src="/profile-image.jpeg" alt="Assistente" className="w-full h-full object-cover" />
                    </div>
                  )}
                   <div
                    className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 animate-fade-in ${
                      message.isBot
                        ? "bg-white text-gray-800 border border-gray-200"
                        : "bg-red-600 text-white"
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
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(isLoading || isTyping) && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--chat-bot-bg)] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Botões de resposta para a primeira pergunta */}
            {showButtons && step === "welcome" && (
              <div className="flex justify-center">
                <div className="flex gap-3 max-w-[80%]">
                  <Button
                    onClick={() => handleButtonClick("SIM")}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-full"
                  >
                    SIM
                  </Button>
                  <Button
                    onClick={() => handleButtonClick("NÃO")}
                    className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full"
                  >
                    NÃO
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900">
          {step !== "completed" && step !== "welcome" ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={currentInput}
                onChange={handleInputChange}
                placeholder={
                  step === "name"
                    ? "Digite seu nome..."
                    : "Digite seu número de WhatsApp..."
                }
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="default"
                disabled={!currentInput.trim() || isLoading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : step === "completed" ? (
            <Button
              onClick={resetQuiz}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              Acessar Grupo do WhatsApp
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};