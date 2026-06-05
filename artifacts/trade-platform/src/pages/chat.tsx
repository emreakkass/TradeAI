import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout";
import { useGetChatHistory, useSendChatMessage, ChatMessage } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const SUGGESTED_QUESTIONS = [
  "Bugün hangi hisseler güçlü?",
  "NVIDIA neden yükseliyor?",
  "Yüksek potansiyelli YZ hisselerini göster",
  "Portföyümün risk durumu nedir?",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const { data: history, isLoading } = useGetChatHistory();
  const sendMessage = useSendChatMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    sendMessage.mutate({ data: { message: text } }, {
      onSuccess: (res) => setMessages(prev => [...prev, res]),
    });
  };

  return (
    <Sidebar>
      <div className="flex flex-col max-w-4xl mx-auto" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="mb-4 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">YZ İşlem Asistanı</h1>
          <p className="text-muted-foreground">TradeAI tarafından desteklenen piyasa içgörüleri ve portföy analizi.</p>
        </div>

        <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden shadow-2xl min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {isLoading ? (
              <div className="flex justify-center p-8 text-muted-foreground">Geçmiş yükleniyor...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6 min-h-[300px]">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bugün nasıl yardımcı olabilirim?</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Piyasa trendlerini analiz edebilir, belirli sembolleri inceleyebilir, portföyünüzü gözden geçirebilir veya yeni işlem kurulumları bulabilirim.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <Button
                      key={q}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 border-border/50 hover:bg-accent/10 hover:text-accent hover:border-accent/30"
                      onClick={() => handleSend(q)}
                    >
                      <Sparkles className="w-3 h-3 mr-2 shrink-0" />
                      <span className="truncate">{q}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-accent" />
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                      }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border/50 bg-card shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="relative flex items-center"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="TradeAI'ya mesaj gönder..."
                className="pr-12 bg-input/50 border-border/50 h-12 rounded-full"
                disabled={sendMessage.isPending}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 w-10 h-10 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={!input.trim() || sendMessage.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Sidebar>
  );
}
