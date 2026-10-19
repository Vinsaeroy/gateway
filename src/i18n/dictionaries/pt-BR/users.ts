const users = {
    title: "Gerenciamento de Usuários",
    subtitle: "Gerencie usuários e papéis",
    loading: "Carregando...",
    addUser: "Adicionar Usuário",
    form: {
        editTitle: "Editar Usuário",
        newTitle: "Novo Usuário",
        name: "Nome",
        email: "E-mail",
        password: "Senha",
        newPassword: "Nova Senha (deixe em branco para manter)",
        role: "Papel",
        plan: "Plano",
        planHint:
            "Altere o plano deste usuário. O período ativo usa a duração padrão do plano (FREE = ilimitado).",
        cancel: "Cancelar",
        update: "Atualizar",
        create: "Criar",
    },
    roles: {
        SUPERADMIN: "Super Admin",
        OWNER: "Owner",
        STAFF: "Staff",
    },
    plans: {
        FREE: "Free",
        STANDARD: "Standard",
        PRO: "Pro",
        ENTERPRISE: "Enterprise",
    },
    card: {
        fallbackName: "Usuário",
        planLabel: "Plano: {plan}",
        planUntil: "· até {date}",
        sessions: "{count} Sessões",
        joined: "Entrou em {date}",
        edit: "Editar",
        delete: "Excluir",
    },
    dialog: {
        title: "Tem absolutamente certeza?",
        description:
            "Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário e removerá seus dados dos nossos servidores.",
        cancel: "Cancelar",
        continue: "Continuar",
    },
    toast: {
        unauthorized: "Não autorizado. Apenas o Super Admin pode ver os usuários.",
        updated: "Usuário atualizado",
        created: "Usuário criado",
        operationFailed: "Falha na operação",
        deleted: "Usuário excluído",
        deleteRejected: "Falha ao excluir",
        deleteFailed: "Falha ao excluir o usuário",
    },
} as const;

export default users;
