const legal = {
    privacy: {
        backToHome: "Voltar para a Página Inicial",
        title: "Política de Privacidade",
        metaDescription: "Política de Privacidade e Tratamento de Dados da WA-AKG.",
        effectiveDate: "Data de vigência: {date}",
        intro:
            "Na WA-AKG, acreditamos que seus dados são sua propriedade. Esta Política de Privacidade detalha os limites estritos sobre como as informações são tratadas ao usar nosso WhatsApp Gateway open-source e self-hosted.",
        s1: {
            title: "1. Arquitetura Sem Rastreamento",
            bodyBefore: "Como a WA-AKG foi projetada para ser ",
            bodyStrong: "self-hosted",
            bodyAfter:
                ", todo o processamento central de dados ocorre exclusivamente no hardware onde você implanta a aplicação.",
            noTelemetryLabel: "Sem Telemetria Centralizada:",
            noTelemetryText:
                "Os criadores da WA-AKG não recebem telemetria, análises nem relatórios de uso sobre suas interações no WhatsApp.",
            ownershipLabel: "Propriedade Absoluta dos Dados:",
            ownershipText:
                "Seus contatos, mensagens, agendamentos e auto-respostas permanecem no seu próprio banco de dados. Não podemos e não acessaremos esses dados.",
        },
        s2: {
            title: "2. Dados que Processamos Localmente",
            body: "Quando você implanta o gateway, a aplicação em seu servidor interage com:",
            credentialsLabel: "Credenciais de Autenticação:",
            credentialsText:
                "As senhas que você cria para o dashboard são armazenadas com hash seguro usando bcrypt antes de serem salvas no seu banco de dados local.",
            sessionsLabel: "Sessões do WhatsApp:",
            sessionsText:
                "A WA-AKG atua como uma ponte para o WhatsApp Web. Os tokens de sessão (keys) necessários para manter essa conexão são armazenados localmente no seu servidor.",
            logsLabel: "Logs de Comunicação:",
            logsText:
                "As mensagens enviadas e recebidas pelo gateway ficam registradas no seu banco de dados local para fornecer dados históricos e funcionalidade de webhook.",
        },
        s3: {
            title: "3. Protegendo Suas Informações",
            body:
                "Embora a WA-AKG seja construída com práticas modernas de segurança, a segurança final dos seus dados depende do seu ambiente de hospedagem. Recomendamos fortemente:",
            proxyBefore:
                "Implantar a aplicação atrás de um reverse proxy com ",
            proxyStrong: "criptografia SSL/TLS",
            proxyAfter: " imposta (HTTPS).",
            firewall:
                "Proteger o servidor host com firewalls e autenticação por chave SSH.",
            updates:
                "Manter o sistema operacional subjacente e o ambiente Node.js sempre atualizados.",
        },
        s4: {
            title: "4. Integrações de Terceiros",
            bodyBefore: "A WA-AKG utiliza a biblioteca ",
            bodyAfter:
                " para se comunicar diretamente com os servidores do WhatsApp. Ao usar este gateway, seu servidor estabelecerá uma conexão web-socket direta com o WhatsApp. Esteja ciente de que seu uso do WhatsApp ainda está sujeito à Política de Privacidade da Meta.",
        },
        needDetails: "Precisa de Mais Detalhes?",
        needDetailsBefore:
            "Se você tem perguntas específicas sobre o tratamento de dados ou deseja auditar o código, visite nosso ",
        needDetailsLink: "Repositório no GitHub",
        needDetailsAfter: ".",
    },
    terms: {
        backToHome: "Voltar para a Página Inicial",
        title: "Termos de Serviço",
        metaDescription: "Termos de Serviço e Diretrizes de Uso da WA-AKG.",
        lastUpdated: "Última atualização: {date}",
        intro:
            "Bem-vindo à WA-AKG. Ao acessar ou usar nossa plataforma WhatsApp Gateway, você concorda em estar vinculado a estes Termos. Se não concorda, por favor, não utilize o serviço.",
        s1: {
            title: "1. Segurança dos Dados e Responsabilidade",
            body:
                "A segurança é o núcleo do nosso serviço. Como uma plataforma self-hosted, a WA-AKG garante que seus dados permaneçam estritamente dentro da sua própria infraestrutura.",
            yoursLabel: "Seus Dados São Seus:",
            yoursText:
                "Não rastreamos, interceptamos nem vendemos suas mensagens do WhatsApp, listas de contatos ou dados de sessão. Suas informações estão seguras e não são mal utilizadas.",
            safeLabel: "Uso Seguro:",
            safeText:
                "Você é responsável por garantir que seu hardware e seus ambientes de servidor estejam devidamente protegidos.",
            authLabel: "Autenticação:",
            authText:
                "Você deve proteger as credenciais da sua conta. Não compartilhe seus dados de login com pessoas não autorizadas.",
        },
        s2: {
            title: "2. Política de Uso Aceitável",
            body:
                "Ao utilizar a API, as auto-respostas e os recursos de broadcast da WA-AKG, você concorda em obedecer aos Termos de Serviço oficiais e às políticas anti-spam do WhatsApp. Você concorda em não:",
            spam: 'Enviar mensagens "spam" não solicitadas ou campanhas promocionais em massa para usuários que não deram consentimento explícito.',
            malware:
                "Usar a plataforma para distribuir software maliciosos, links de phishing ou conteúdo ilegal.",
            overload:
                "Tentar fazer engenharia reversa da API principal ou sobrecarregar o serviço com requisições excessivas.",
        },
        s3: {
            title: "3. Integridade da Conta",
            body:
                "A WA-AKG oferece ferramentas para gerenciar várias sessões do WhatsApp. É fundamental monitorar seus dispositivos ativos. Se você suspeitar de acesso não autorizado ao dashboard do gateway, altere imediatamente sua senha e revogue todas as sessões do WhatsApp conectadas no seu dispositivo físico.",
        },
        s4: {
            title: "4. Isenções e Limitações",
            body:
                'A WA-AKG é fornecida "como está" e sem garantias de qualquer tipo. Utilizamos bibliotecas de terceiros (como a Baileys) para conectar aos protocolos web do WhatsApp. Alterações nos sistemas internos do WhatsApp podem ocasionalmente interromper o serviço. Não nos responsabilizamos por suspensões ou banimentos de conta impostos pelo WhatsApp em decorrência do seu uso.',
        },
        questions: "Tem dúvidas sobre estes termos?",
        questionsBefore: "Confira nossa ",
        questionsLink: "Documentação",
        questionsAfter:
            " ou entre em contato com os mantenedores do projeto para mais esclarecimentos.",
    },
} as const;

export default legal;
