export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      admin_extra_profiles: {
        Row: {
          admin_email: string
          created_at: string | null
          id: string
          profile_id: string
          profile_nome: string | null
          role: string
        }
        Insert: {
          admin_email: string
          created_at?: string | null
          id?: string
          profile_id: string
          profile_nome?: string | null
          role: string
        }
        Update: {
          admin_email?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          profile_nome?: string | null
          role?: string
        }
        Relationships: []
      }
      alunos: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          bairro: string | null
          bairro_responsavel: string | null
          cep: string | null
          cep_responsavel: string | null
          complemento: string | null
          complemento_responsavel: string | null
          cpf: string | null
          cpf_resp_financeiro: string | null
          cpf_responsavel: string | null
          created_at: string | null
          data_nascimento: string | null
          data_primeira_matricula: string | null
          deletado: boolean
          documento_estrangeiro: string | null
          email: string
          email_resp_financeiro: string | null
          email_responsavel: string | null
          endereco_completo: string | null
          endereco_estrangeiro: boolean | null
          endereco_estrangeiro_responsavel: boolean | null
          endereco_responsavel: string | null
          estado_civil: string | null
          estado_civil_responsavel: string | null
          estrangeiro: boolean | null
          genero: string | null
          id: string
          logradouro: string | null
          logradouro_responsavel: string | null
          menor_idade: boolean | null
          municipio: string | null
          municipio_responsavel: string | null
          nacionalidade: string | null
          nacionalidade_responsavel: string | null
          nivel_id: string | null
          nome: string
          nome_resp_financeiro: string | null
          nome_responsavel: string | null
          numero: string | null
          numero_responsavel: string | null
          observacao: string | null
          pais: string | null
          pais_responsavel: string | null
          profissao: string | null
          profissao_responsavel: string | null
          responsavel_financeiro: boolean | null
          rg: string | null
          rg_responsavel: string | null
          status: string | null
          telefone: string | null
          telefone_ddi: string | null
          telefone_resp_financeiro: string | null
          telefone_responsavel: string | null
          tipo_documento: string | null
          uf: string | null
          uf_responsavel: string | null
          updated_at: string | null
          whatsapp: string | null
          whatsapp_ddi: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bairro_responsavel?: string | null
          cep?: string | null
          cep_responsavel?: string | null
          complemento?: string | null
          complemento_responsavel?: string | null
          cpf?: string | null
          cpf_resp_financeiro?: string | null
          cpf_responsavel?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          data_primeira_matricula?: string | null
          deletado?: boolean
          documento_estrangeiro?: string | null
          email: string
          email_resp_financeiro?: string | null
          email_responsavel?: string | null
          endereco_completo?: string | null
          endereco_estrangeiro?: boolean | null
          endereco_estrangeiro_responsavel?: boolean | null
          endereco_responsavel?: string | null
          estado_civil?: string | null
          estado_civil_responsavel?: string | null
          estrangeiro?: boolean | null
          genero?: string | null
          id?: string
          logradouro?: string | null
          logradouro_responsavel?: string | null
          menor_idade?: boolean | null
          municipio?: string | null
          municipio_responsavel?: string | null
          nacionalidade?: string | null
          nacionalidade_responsavel?: string | null
          nivel_id?: string | null
          nome: string
          nome_resp_financeiro?: string | null
          nome_responsavel?: string | null
          numero?: string | null
          numero_responsavel?: string | null
          observacao?: string | null
          pais?: string | null
          pais_responsavel?: string | null
          profissao?: string | null
          profissao_responsavel?: string | null
          responsavel_financeiro?: boolean | null
          rg?: string | null
          rg_responsavel?: string | null
          status?: string | null
          telefone?: string | null
          telefone_ddi?: string | null
          telefone_resp_financeiro?: string | null
          telefone_responsavel?: string | null
          tipo_documento?: string | null
          uf?: string | null
          uf_responsavel?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          whatsapp_ddi?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bairro_responsavel?: string | null
          cep?: string | null
          cep_responsavel?: string | null
          complemento?: string | null
          complemento_responsavel?: string | null
          cpf?: string | null
          cpf_resp_financeiro?: string | null
          cpf_responsavel?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          data_primeira_matricula?: string | null
          deletado?: boolean
          documento_estrangeiro?: string | null
          email?: string
          email_resp_financeiro?: string | null
          email_responsavel?: string | null
          endereco_completo?: string | null
          endereco_estrangeiro?: boolean | null
          endereco_estrangeiro_responsavel?: boolean | null
          endereco_responsavel?: string | null
          estado_civil?: string | null
          estado_civil_responsavel?: string | null
          estrangeiro?: boolean | null
          genero?: string | null
          id?: string
          logradouro?: string | null
          logradouro_responsavel?: string | null
          menor_idade?: boolean | null
          municipio?: string | null
          municipio_responsavel?: string | null
          nacionalidade?: string | null
          nacionalidade_responsavel?: string | null
          nivel_id?: string | null
          nome?: string
          nome_resp_financeiro?: string | null
          nome_responsavel?: string | null
          numero?: string | null
          numero_responsavel?: string | null
          observacao?: string | null
          pais?: string | null
          pais_responsavel?: string | null
          profissao?: string | null
          profissao_responsavel?: string | null
          responsavel_financeiro?: boolean | null
          rg?: string | null
          rg_responsavel?: string | null
          status?: string | null
          telefone?: string | null
          telefone_ddi?: string | null
          telefone_resp_financeiro?: string | null
          telefone_responsavel?: string | null
          tipo_documento?: string | null
          uf?: string | null
          uf_responsavel?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          whatsapp_ddi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveis"
            referencedColumns: ["id"]
          },
        ]
      }
      atendentes_marketing: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_by_email: string | null
          changed_by_role: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          changed_by_email?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          changed_by_email?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      avaliacao: {
        Row: {
          created_at: string | null
          data_avaliacao: string | null
          id: string
          nome: string
          turma_id: string | null
          turma_id_all: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_avaliacao?: string | null
          id?: string
          nome: string
          turma_id?: string | null
          turma_id_all?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_avaliacao?: string | null
          id?: string
          nome?: string
          turma_id?: string | null
          turma_id_all?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_notas: {
        Row: {
          aluno_id: string
          avaliacao_id: string
          created_at: string | null
          id: string
          nota: number | null
          parecer: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          avaliacao_id: string
          created_at?: string | null
          id?: string
          nota?: number | null
          parecer?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          avaliacao_id?: string
          created_at?: string | null
          id?: string
          nota?: number | null
          parecer?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_notas_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacao"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          aluno_ids: string[]
          atualizado_em: string
          criado_em: string
          data_referencia: string | null
          descricao: string
          destinatario: string
          id: string
          professor_ids: string[]
          tipo_data_referencia: string | null
          todos_alunos: boolean
          todos_professores: boolean
          vigencia_fim: string
          vigencia_inicio: string
        }
        Insert: {
          aluno_ids?: string[]
          atualizado_em?: string
          criado_em?: string
          data_referencia?: string | null
          descricao: string
          destinatario?: string
          id?: string
          professor_ids?: string[]
          tipo_data_referencia?: string | null
          todos_alunos?: boolean
          todos_professores?: boolean
          vigencia_fim: string
          vigencia_inicio?: string
        }
        Update: {
          aluno_ids?: string[]
          atualizado_em?: string
          criado_em?: string
          data_referencia?: string | null
          descricao?: string
          destinatario?: string
          id?: string
          professor_ids?: string[]
          tipo_data_referencia?: string | null
          todos_alunos?: boolean
          todos_professores?: boolean
          vigencia_fim?: string
          vigencia_inicio?: string
        }
        Relationships: []
      }
      canais_captacao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          bairro: string | null
          banco: string | null
          celular: string | null
          cep: string | null
          chave_pix: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          data_inicio_parceria: string | null
          data_nascimento: string | null
          deletado: boolean | null
          email: string | null
          genero: string | null
          id: string
          logradouro: string | null
          municipio: string | null
          nacionalidade: string | null
          naturalidade: string | null
          nome: string
          numero: string | null
          numero_conta: string | null
          telefone_recado: string | null
          uf: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          bairro?: string | null
          banco?: string | null
          celular?: string | null
          cep?: string | null
          chave_pix?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_inicio_parceria?: string | null
          data_nascimento?: string | null
          deletado?: boolean | null
          email?: string | null
          genero?: string | null
          id?: string
          logradouro?: string | null
          municipio?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome: string
          numero?: string | null
          numero_conta?: string | null
          telefone_recado?: string | null
          uf?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          bairro?: string | null
          banco?: string | null
          celular?: string | null
          cep?: string | null
          chave_pix?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_inicio_parceria?: string | null
          data_nascimento?: string | null
          deletado?: boolean | null
          email?: string | null
          genero?: string | null
          id?: string
          logradouro?: string | null
          municipio?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome?: string
          numero?: string | null
          numero_conta?: string | null
          telefone_recado?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      comentarios_aula: {
        Row: {
          aula_id: string | null
          autor_id: string | null
          autor_nome: string | null
          autor_role: string | null
          conteudo: string
          created_at: string | null
          id: string
        }
        Insert: {
          aula_id?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          autor_role?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
        }
        Update: {
          aula_id?: string | null
          autor_id?: string | null
          autor_nome?: string | null
          autor_role?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_aula_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "registro_aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_sistema: {
        Row: {
          atualizado_em: string | null
          chave: string
          criado_em: string | null
          id: string
          valor: string | null
        }
        Insert: {
          atualizado_em?: string | null
          chave: string
          criado_em?: string | null
          id?: string
          valor?: string | null
        }
        Update: {
          atualizado_em?: string | null
          chave?: string
          criado_em?: string | null
          id?: string
          valor?: string | null
        }
        Relationships: []
      }
      contas_comentarios: {
        Row: {
          autor_id: string | null
          autor_nome: string | null
          autor_role: string | null
          conta_id: string | null
          conteudo: string
          created_at: string | null
          id: string
        }
        Insert: {
          autor_id?: string | null
          autor_nome?: string | null
          autor_role?: string | null
          conta_id?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
        }
        Update: {
          autor_id?: string | null
          autor_nome?: string | null
          autor_role?: string | null
          conta_id?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_comentarios_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_financeiras: {
        Row: {
          arquivado: boolean | null
          categoria: string | null
          comprovante_url: string | null
          created_at: string | null
          data_geracao: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          forma_pagamento_id: string | null
          hora_aula_prof: number | null
          id: string
          matricula_id: string | null
          mes_referencia: string | null
          status: string | null
          tipo: string
          valor: number
          valor_pago: number | null
          valor_pago_manual: boolean | null
          valor_professor: number | null
        }
        Insert: {
          arquivado?: boolean | null
          categoria?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao: string
          forma_pagamento_id?: string | null
          hora_aula_prof?: number | null
          id?: string
          matricula_id?: string | null
          mes_referencia?: string | null
          status?: string | null
          tipo: string
          valor: number
          valor_pago?: number | null
          valor_pago_manual?: boolean | null
          valor_professor?: number | null
        }
        Update: {
          arquivado?: boolean | null
          categoria?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data_geracao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento_id?: string | null
          hora_aula_prof?: number | null
          id?: string
          matricula_id?: string | null
          mes_referencia?: string | null
          status?: string | null
          tipo?: string
          valor?: number
          valor_pago?: number | null
          valor_pago_manual?: boolean | null
          valor_professor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_financeiras_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_financeiras_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_models: {
        Row: {
          ativo: boolean
          created_at: string
          created_by_email: string | null
          descricao: string | null
          id: string
          nome: string
          num_clausulas: number
          secoes: Json
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by_email?: string | null
          descricao?: string | null
          id?: string
          nome: string
          num_clausulas?: number
          secoes?: Json
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by_email?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          num_clausulas?: number
          secoes?: Json
        }
        Relationships: []
      }
      contract_section_versions: {
        Row: {
          ativo: boolean
          created_at: string
          created_by_email: string | null
          id: string
          nome_versao: string
          section_id: string
          storage_path: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by_email?: string | null
          id?: string
          nome_versao: string
          section_id: string
          storage_path: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by_email?: string | null
          id?: string
          nome_versao?: string
          section_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_section_versions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "contract_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_sections: {
        Row: {
          id: string
          nome: string
          ordem: number
          tags_sugeridas: string[]
          tipo: string
        }
        Insert: {
          id?: string
          nome: string
          ordem: number
          tags_sugeridas?: string[]
          tipo: string
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          tags_sugeridas?: string[]
          tipo?: string
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          created_by_email: string | null
          descricao: string | null
          id: string
          nome: string
          storage_path: string
          tipo_arquivo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          created_by_email?: string | null
          descricao?: string | null
          id?: string
          nome: string
          storage_path: string
          tipo_arquivo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          created_by_email?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          storage_path?: string
          tipo_arquivo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cursos: {
        Row: {
          ativo: boolean | null
          carga_horaria: number | null
          classificacao: string | null
          created_at: string | null
          deletado: boolean
          descricao: string | null
          id: string
          idioma_id_deprecated: string | null
          nivel: string | null
          nivel_id: string | null
          nome: string
          pacote_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria?: number | null
          classificacao?: string | null
          created_at?: string | null
          deletado?: boolean
          descricao?: string | null
          id?: string
          idioma_id_deprecated?: string | null
          nivel?: string | null
          nivel_id?: string | null
          nome: string
          pacote_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          carga_horaria?: number | null
          classificacao?: string | null
          created_at?: string | null
          deletado?: boolean
          descricao?: string | null
          id?: string
          idioma_id_deprecated?: string | null
          nivel?: string | null
          nivel_id?: string | null
          nome?: string
          pacote_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cursos_idioma_id_fkey"
            columns: ["idioma_id_deprecated"]
            isOneToOne: false
            referencedRelation: "idiomas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_aluno: {
        Row: {
          aluno_id: string | null
          created_at: string | null
          id: string
          nome: string
          tipo: string | null
          url: string
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string | null
          id?: string
          nome: string
          tipo?: string | null
          url: string
        }
        Update: {
          aluno_id?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_professor: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          professor_id: string | null
          tipo: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          professor_id?: string | null
          tipo?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          professor_id?: string | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_professor_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_turma: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          tipo: string | null
          turma_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          tipo?: string | null
          turma_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string | null
          turma_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_access_grants: {
        Row: {
          connection_id: string
          folder_id: string | null
          folder_name: string | null
          granted_at: string | null
          granted_by_email: string | null
          granted_to_id: string
          granted_to_type: string
          id: string
        }
        Insert: {
          connection_id: string
          folder_id?: string | null
          folder_name?: string | null
          granted_at?: string | null
          granted_by_email?: string | null
          granted_to_id: string
          granted_to_type: string
          id?: string
        }
        Update: {
          connection_id?: string
          folder_id?: string | null
          folder_name?: string | null
          granted_at?: string | null
          granted_by_email?: string | null
          granted_to_id?: string
          granted_to_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_access_grants_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "drive_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_connections: {
        Row: {
          access_token: string | null
          connected_at: string | null
          google_email: string | null
          id: string
          owner_id: string | null
          owner_type: string
          refresh_token: string
          root_folder_id: string | null
          root_folder_name: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          google_email?: string | null
          id?: string
          owner_id?: string | null
          owner_type: string
          refresh_token: string
          root_folder_id?: string | null
          root_folder_name?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          google_email?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          refresh_token?: string
          root_folder_id?: string | null
          root_folder_name?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      extraction_logs: {
        Row: {
          created_at: string | null
          entrada_saida_type: string
          export_format: string
          extraction_date: string | null
          id: string
          period_type: string
          period_value: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entrada_saida_type: string
          export_format: string
          extraction_date?: string | null
          id?: string
          period_type: string
          period_value: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entrada_saida_type?: string
          export_format?: string
          extraction_date?: string | null
          id?: string
          period_type?: string
          period_value?: string
          user_id?: string | null
        }
        Relationships: []
      }
      formas_pagamento: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      funis: {
        Row: {
          created_at: string | null
          etapas: Json
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          etapas?: Json
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          etapas?: Json
          id?: string
          nome?: string
        }
        Relationships: []
      }
      idiomas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          deletado: boolean
          id: string
          idioma: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          deletado?: boolean
          id?: string
          idioma: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          deletado?: boolean
          id?: string
          idioma?: string
        }
        Relationships: []
      }
      inativacoes: {
        Row: {
          created_at: string | null
          entidade: string
          entidade_id: string
          entidade_nome: string | null
          id: string
          inativado_por: string | null
          inativado_por_nome: string | null
          observacao: string | null
          situacao: string | null
        }
        Insert: {
          created_at?: string | null
          entidade: string
          entidade_id: string
          entidade_nome?: string | null
          id?: string
          inativado_por?: string | null
          inativado_por_nome?: string | null
          observacao?: string | null
          situacao?: string | null
        }
        Update: {
          created_at?: string | null
          entidade?: string
          entidade_id?: string
          entidade_nome?: string | null
          id?: string
          inativado_por?: string | null
          inativado_por_nome?: string | null
          observacao?: string | null
          situacao?: string | null
        }
        Relationships: []
      }
      materiais: {
        Row: {
          aula_id: string | null
          created_at: string | null
          data_upload: string | null
          descricao: string | null
          id: string
          link_externo: string | null
          professor_id: string | null
          tipo_arquivo: string | null
          titulo: string
          turma_id: string | null
          updated_at: string | null
          url_arquivo: string | null
        }
        Insert: {
          aula_id?: string | null
          created_at?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          link_externo?: string | null
          professor_id?: string | null
          tipo_arquivo?: string | null
          titulo: string
          turma_id?: string | null
          updated_at?: string | null
          url_arquivo?: string | null
        }
        Update: {
          aula_id?: string | null
          created_at?: string | null
          data_upload?: string | null
          descricao?: string | null
          id?: string
          link_externo?: string | null
          professor_id?: string | null
          tipo_arquivo?: string | null
          titulo?: string
          turma_id?: string | null
          updated_at?: string | null
          url_arquivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "registro_aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_curso: {
        Row: {
          created_at: string | null
          curso_id: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          aluno_id: string | null
          ativo: boolean | null
          contrato_nome: string | null
          contrato_url: string | null
          created_at: string | null
          data_primeira_cobranca: string | null
          desconto_percentual: number | null
          dia_vencimento: number | null
          forma_pagamento_id: string | null
          id: string
          isento_matricula: boolean | null
          numero_parcelas: number | null
          parcelas_pagas: number
          taxa_administrativa: number | null
          taxa_matricula: number | null
          turma_id: string | null
          valor_base: number | null
          valor_final_mensal: number | null
          valor_mensal: number | null
          valor_mensalidade: number | null
        }
        Insert: {
          aluno_id?: string | null
          ativo?: boolean | null
          contrato_nome?: string | null
          contrato_url?: string | null
          created_at?: string | null
          data_primeira_cobranca?: string | null
          desconto_percentual?: number | null
          dia_vencimento?: number | null
          forma_pagamento_id?: string | null
          id?: string
          isento_matricula?: boolean | null
          numero_parcelas?: number | null
          parcelas_pagas?: number
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          turma_id?: string | null
          valor_base?: number | null
          valor_final_mensal?: number | null
          valor_mensal?: number | null
          valor_mensalidade?: number | null
        }
        Update: {
          aluno_id?: string | null
          ativo?: boolean | null
          contrato_nome?: string | null
          contrato_url?: string | null
          created_at?: string | null
          data_primeira_cobranca?: string | null
          desconto_percentual?: number | null
          dia_vencimento?: number | null
          forma_pagamento_id?: string | null
          id?: string
          isento_matricula?: boolean | null
          numero_parcelas?: number | null
          parcelas_pagas?: number
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          turma_id?: string | null
          valor_base?: number | null
          valor_final_mensal?: number | null
          valor_mensal?: number | null
          valor_mensalidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          arquivado_destinatario: boolean | null
          arquivado_remetente: boolean | null
          assunto: string | null
          conteudo: string
          created_at: string | null
          data_envio: string | null
          destinatario_id: string
          id: string
          lida: boolean | null
          remetente_id: string
          tipo_destinatario: string
          tipo_remetente: string
        }
        Insert: {
          arquivado_destinatario?: boolean | null
          arquivado_remetente?: boolean | null
          assunto?: string | null
          conteudo: string
          created_at?: string | null
          data_envio?: string | null
          destinatario_id: string
          id?: string
          lida?: boolean | null
          remetente_id: string
          tipo_destinatario: string
          tipo_remetente: string
        }
        Update: {
          arquivado_destinatario?: boolean | null
          arquivado_remetente?: boolean | null
          assunto?: string | null
          conteudo?: string
          created_at?: string | null
          data_envio?: string | null
          destinatario_id?: string
          id?: string
          lida?: boolean | null
          remetente_id?: string
          tipo_destinatario?: string
          tipo_remetente?: string
        }
        Relationships: []
      }
      niveis: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      pacotes: {
        Row: {
          ativo: boolean | null
          aulas_utilizadas: number | null
          created_at: string | null
          deletado: boolean
          duracao_meses: number | null
          id: string
          is_avulsa: boolean | null
          nome_pacote: string | null
          numero_parcelas: number | null
          percentual_professor_padrao: number | null
          qtde_aulas: number | null
          taxa_administrativa: number | null
          taxa_matricula: number | null
          updated_at: string | null
          valor_hora: number | null
          valor_mensal: number | null
        }
        Insert: {
          ativo?: boolean | null
          aulas_utilizadas?: number | null
          created_at?: string | null
          deletado?: boolean
          duracao_meses?: number | null
          id?: string
          is_avulsa?: boolean | null
          nome_pacote?: string | null
          numero_parcelas?: number | null
          percentual_professor_padrao?: number | null
          qtde_aulas?: number | null
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          updated_at?: string | null
          valor_hora?: number | null
          valor_mensal?: number | null
        }
        Update: {
          ativo?: boolean | null
          aulas_utilizadas?: number | null
          created_at?: string | null
          deletado?: boolean
          duracao_meses?: number | null
          id?: string
          is_avulsa?: boolean | null
          nome_pacote?: string | null
          numero_parcelas?: number | null
          percentual_professor_padrao?: number | null
          qtde_aulas?: number | null
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          updated_at?: string | null
          valor_hora?: number | null
          valor_mensal?: number | null
        }
        Relationships: []
      }
      professor_turma: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          percentual_ajuste: number | null
          professor_id: string
          turma_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          percentual_ajuste?: number | null
          professor_id: string
          turma_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          percentual_ajuste?: number | null
          professor_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_turma_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          celular: string | null
          cep: string | null
          chave_pix: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          data_contratacao: string | null
          data_inicio_parceria: string | null
          data_nascimento: string | null
          deletado: boolean
          disponibilidade: Json
          email: string
          email_ttm: string | null
          especialidade: string | null
          genero: string | null
          hora_aula_percentual: number | null
          id: string
          idiomas: string[] | null
          idiomas_ids: string[] | null
          logradouro: string | null
          municipio: string | null
          nacionalidade: string | null
          naturalidade: string | null
          nome: string
          numero: string | null
          numero_conta: string | null
          telefone: string | null
          telefone_recado: string | null
          uf: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          celular?: string | null
          cep?: string | null
          chave_pix?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_contratacao?: string | null
          data_inicio_parceria?: string | null
          data_nascimento?: string | null
          deletado?: boolean
          disponibilidade?: Json
          email: string
          email_ttm?: string | null
          especialidade?: string | null
          genero?: string | null
          hora_aula_percentual?: number | null
          id?: string
          idiomas?: string[] | null
          idiomas_ids?: string[] | null
          logradouro?: string | null
          municipio?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome: string
          numero?: string | null
          numero_conta?: string | null
          telefone?: string | null
          telefone_recado?: string | null
          uf?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          celular?: string | null
          cep?: string | null
          chave_pix?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_contratacao?: string | null
          data_inicio_parceria?: string | null
          data_nascimento?: string | null
          deletado?: boolean
          disponibilidade?: Json
          email?: string
          email_ttm?: string | null
          especialidade?: string | null
          genero?: string | null
          hora_aula_percentual?: number | null
          id?: string
          idiomas?: string[] | null
          idiomas_ids?: string[] | null
          logradouro?: string | null
          municipio?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome?: string
          numero?: string | null
          numero_conta?: string | null
          telefone?: string | null
          telefone_recado?: string | null
          uf?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          atendente: string | null
          canal: string | null
          canal_captacao: string | null
          canal_captacao_id: string | null
          canal_captacao_tipo: string | null
          created_at: string | null
          curso_interesse: string | null
          data_1_contato: string | null
          data_primeiro_contato: string | null
          data_ultimo_contato: string | null
          dia_semana: string | null
          email: string | null
          estagio: string | null
          funil_id: string | null
          id: string
          interagiu_bot: boolean | null
          nivel: string | null
          nome: string
          nome_anuncio: string | null
          numero_contatos: number | null
          observacoes: string | null
          origem_url: string | null
          periodo: string | null
          pontos_atencao: string | null
          primeiro_atendente_id: string | null
          procura: string | null
          situacao: string | null
          situacao_id: string | null
          telefone: string | null
          ultimo_atendente_id: string | null
          updated_at: string | null
        }
        Insert: {
          atendente?: string | null
          canal?: string | null
          canal_captacao?: string | null
          canal_captacao_id?: string | null
          canal_captacao_tipo?: string | null
          created_at?: string | null
          curso_interesse?: string | null
          data_1_contato?: string | null
          data_primeiro_contato?: string | null
          data_ultimo_contato?: string | null
          dia_semana?: string | null
          email?: string | null
          estagio?: string | null
          funil_id?: string | null
          id?: string
          interagiu_bot?: boolean | null
          nivel?: string | null
          nome: string
          nome_anuncio?: string | null
          numero_contatos?: number | null
          observacoes?: string | null
          origem_url?: string | null
          periodo?: string | null
          pontos_atencao?: string | null
          primeiro_atendente_id?: string | null
          procura?: string | null
          situacao?: string | null
          situacao_id?: string | null
          telefone?: string | null
          ultimo_atendente_id?: string | null
          updated_at?: string | null
        }
        Update: {
          atendente?: string | null
          canal?: string | null
          canal_captacao?: string | null
          canal_captacao_id?: string | null
          canal_captacao_tipo?: string | null
          created_at?: string | null
          curso_interesse?: string | null
          data_1_contato?: string | null
          data_primeiro_contato?: string | null
          data_ultimo_contato?: string | null
          dia_semana?: string | null
          email?: string | null
          estagio?: string | null
          funil_id?: string | null
          id?: string
          interagiu_bot?: boolean | null
          nivel?: string | null
          nome?: string
          nome_anuncio?: string | null
          numero_contatos?: number | null
          observacoes?: string | null
          origem_url?: string | null
          periodo?: string | null
          pontos_atencao?: string | null
          primeiro_atendente_id?: string | null
          procura?: string | null
          situacao?: string | null
          situacao_id?: string | null
          telefone?: string | null
          ultimo_atendente_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prospects_primeiro_atendente"
            columns: ["primeiro_atendente_id"]
            isOneToOne: false
            referencedRelation: "atendentes_marketing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_funil_id_fkey"
            columns: ["funil_id"]
            isOneToOne: false
            referencedRelation: "funis"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_aulas: {
        Row: {
          aluno_id: string | null
          conta_id: string | null
          conteudo_ministrado: string | null
          created_at: string | null
          data_aula: string
          hora_aula: string | null
          hora_aula_prof_snapshot: number | null
          id: string
          locked: boolean | null
          material_utilizado: string | null
          numero_aula_manual: number | null
          observacoes: string | null
          pacote_avulso_id: string | null
          pacote_id_snapshot: string | null
          presenca: boolean | null
          professor_id: string | null
          slot_horario: number
          status: string | null
          substituto_nome: string | null
          turma_id: string | null
          updated_at: string | null
          valor_avulso: number | null
        }
        Insert: {
          aluno_id?: string | null
          conta_id?: string | null
          conteudo_ministrado?: string | null
          created_at?: string | null
          data_aula: string
          hora_aula?: string | null
          hora_aula_prof_snapshot?: number | null
          id?: string
          locked?: boolean | null
          material_utilizado?: string | null
          numero_aula_manual?: number | null
          observacoes?: string | null
          pacote_avulso_id?: string | null
          pacote_id_snapshot?: string | null
          presenca?: boolean | null
          professor_id?: string | null
          slot_horario?: number
          status?: string | null
          substituto_nome?: string | null
          turma_id?: string | null
          updated_at?: string | null
          valor_avulso?: number | null
        }
        Update: {
          aluno_id?: string | null
          conta_id?: string | null
          conteudo_ministrado?: string | null
          created_at?: string | null
          data_aula?: string
          hora_aula?: string | null
          hora_aula_prof_snapshot?: number | null
          id?: string
          locked?: boolean | null
          material_utilizado?: string | null
          numero_aula_manual?: number | null
          observacoes?: string | null
          pacote_avulso_id?: string | null
          pacote_id_snapshot?: string | null
          presenca?: boolean | null
          professor_id?: string | null
          slot_horario?: number
          status?: string | null
          substituto_nome?: string | null
          turma_id?: string | null
          updated_at?: string | null
          valor_avulso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_aulas_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_aulas_pacote_avulso_id_fkey"
            columns: ["pacote_avulso_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      secretaria_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          permissions: Json | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          permissions?: Json | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          permissions?: Json | null
          role?: string | null
        }
        Relationships: []
      }
      secretaria_shortcuts: {
        Row: {
          created_at: string | null
          created_by_email: string | null
          drive_folder_id: string
          drive_folder_name: string | null
          icon_name: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          created_at?: string | null
          created_by_email?: string | null
          drive_folder_id: string
          drive_folder_name?: string | null
          icon_name?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          created_at?: string | null
          created_by_email?: string | null
          drive_folder_id?: string
          drive_folder_name?: string | null
          icon_name?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      situacoes_prospect: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      spress_blog_posts: {
        Row: {
          autor_id: string | null
          capa_url: string | null
          conteudo: string | null
          created_at: string
          id: string
          publicado_em: string | null
          resumo: string | null
          slug: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          capa_url?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          publicado_em?: string | null
          resumo?: string | null
          slug: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          capa_url?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          publicado_em?: string | null
          resumo?: string | null
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_blog_posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "spress_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_categorias_financeiras: {
        Row: {
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      spress_clientes: {
        Row: {
          atendente_id: string | null
          cnpj: string | null
          created_at: string
          id: string
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          status: string
          updated_at: string
        }
        Insert: {
          atendente_id?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          status?: string
          updated_at?: string
        }
        Update: {
          atendente_id?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_clientes_atendente_id_fkey"
            columns: ["atendente_id"]
            isOneToOne: false
            referencedRelation: "spress_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_clientes_contatos: {
        Row: {
          auth_user_id: string | null
          cargo: string | null
          cliente_id: string
          created_at: string
          email: string | null
          id: string
          nome: string
          principal: boolean
          telefone: string | null
        }
        Insert: {
          auth_user_id?: string | null
          cargo?: string | null
          cliente_id: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          principal?: boolean
          telefone?: string | null
        }
        Update: {
          auth_user_id?: string | null
          cargo?: string | null
          cliente_id?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          principal?: boolean
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_clientes_contatos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_clipping: {
        Row: {
          alcance_estimado: number | null
          cliente_id: string
          created_at: string
          data_publicacao: string | null
          id: string
          jornalista_id: string | null
          pauta_id: string | null
          sentimento: string | null
          titulo: string | null
          url: string | null
          valor_midia: number | null
          veiculo_id: string | null
        }
        Insert: {
          alcance_estimado?: number | null
          cliente_id: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          jornalista_id?: string | null
          pauta_id?: string | null
          sentimento?: string | null
          titulo?: string | null
          url?: string | null
          valor_midia?: number | null
          veiculo_id?: string | null
        }
        Update: {
          alcance_estimado?: number | null
          cliente_id?: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          jornalista_id?: string | null
          pauta_id?: string | null
          sentimento?: string | null
          titulo?: string | null
          url?: string | null
          valor_midia?: number | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_clipping_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_clipping_jornalista_id_fkey"
            columns: ["jornalista_id"]
            isOneToOne: false
            referencedRelation: "spress_jornalistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_clipping_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "spress_pautas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_clipping_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "spress_veiculos_imprensa"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_colunas: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
          quadro_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          quadro_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          quadro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_colunas_quadro_id_fkey"
            columns: ["quadro_id"]
            isOneToOne: false
            referencedRelation: "spress_quadros"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_contas_pagar: {
        Row: {
          categoria_id: string | null
          created_at: string
          descricao: string
          fornecedor: string
          id: string
          pago_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descricao: string
          fornecedor: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string
          fornecedor?: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "spress_categorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_contas_receber: {
        Row: {
          categoria_id: string | null
          cliente_id: string | null
          contrato_id: string | null
          created_at: string
          descricao: string
          id: string
          pago_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria_id?: string | null
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          descricao: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          descricao?: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_contas_receber_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "spress_categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_contas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_contas_receber_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "spress_contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_contratos: {
        Row: {
          cliente_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          servicos: string[]
          status: string
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          servicos?: string[]
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          servicos?: string[]
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demanda_anexos: {
        Row: {
          created_at: string
          demanda_id: string
          enviado_por: string | null
          id: string
          nome_arquivo: string
          tamanho_bytes: number | null
          url: string
        }
        Insert: {
          created_at?: string
          demanda_id: string
          enviado_por?: string | null
          id?: string
          nome_arquivo: string
          tamanho_bytes?: number | null
          url: string
        }
        Update: {
          created_at?: string
          demanda_id?: string
          enviado_por?: string | null
          id?: string
          nome_arquivo?: string
          tamanho_bytes?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_demanda_anexos_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demanda_checklist: {
        Row: {
          concluido: boolean
          created_at: string
          demanda_id: string
          descricao: string
          id: string
          ordem: number
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          demanda_id: string
          descricao: string
          id?: string
          ordem?: number
        }
        Update: {
          concluido?: boolean
          created_at?: string
          demanda_id?: string
          descricao?: string
          id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "spress_demanda_checklist_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demanda_comentarios: {
        Row: {
          autor_id: string
          created_at: string
          demanda_id: string
          id: string
          texto: string
        }
        Insert: {
          autor_id: string
          created_at?: string
          demanda_id: string
          id?: string
          texto: string
        }
        Update: {
          autor_id?: string
          created_at?: string
          demanda_id?: string
          id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_demanda_comentarios_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demanda_historico: {
        Row: {
          alterado_por: string | null
          coluna_anterior_id: string | null
          coluna_nova_id: string | null
          created_at: string
          demanda_id: string
          id: string
        }
        Insert: {
          alterado_por?: string | null
          coluna_anterior_id?: string | null
          coluna_nova_id?: string | null
          created_at?: string
          demanda_id: string
          id?: string
        }
        Update: {
          alterado_por?: string | null
          coluna_anterior_id?: string | null
          coluna_nova_id?: string | null
          created_at?: string
          demanda_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_demanda_historico_coluna_anterior_id_fkey"
            columns: ["coluna_anterior_id"]
            isOneToOne: false
            referencedRelation: "spress_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demanda_historico_coluna_nova_id_fkey"
            columns: ["coluna_nova_id"]
            isOneToOne: false
            referencedRelation: "spress_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demanda_historico_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demanda_labels: {
        Row: {
          demanda_id: string
          label_id: string
        }
        Insert: {
          demanda_id: string
          label_id: string
        }
        Update: {
          demanda_id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_demanda_labels_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demanda_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "spress_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_demandas: {
        Row: {
          atendente_id: string | null
          cliente_id: string | null
          coluna_id: string
          concluida_em: string | null
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          ordem: number
          origem: string
          prazo: string | null
          prioridade: string
          quadro_id: string
          responsavel_id: string | null
          setor_id: string | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          atendente_id?: string | null
          cliente_id?: string | null
          coluna_id: string
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          origem?: string
          prazo?: string | null
          prioridade?: string
          quadro_id: string
          responsavel_id?: string | null
          setor_id?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          atendente_id?: string | null
          cliente_id?: string | null
          coluna_id?: string
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          origem?: string
          prazo?: string | null
          prioridade?: string
          quadro_id?: string
          responsavel_id?: string | null
          setor_id?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_demandas_atendente_id_fkey"
            columns: ["atendente_id"]
            isOneToOne: false
            referencedRelation: "spress_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demandas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demandas_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "spress_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demandas_quadro_id_fkey"
            columns: ["quadro_id"]
            isOneToOne: false
            referencedRelation: "spress_quadros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demandas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "spress_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_demandas_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "spress_setores"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_jornalistas: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          pauta_interesse: string | null
          telefone: string | null
          veiculo_id: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          pauta_interesse?: string | null
          telefone?: string | null
          veiculo_id?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          pauta_interesse?: string | null
          telefone?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_jornalistas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "spress_veiculos_imprensa"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_labels: {
        Row: {
          cor: string
          id: string
          nome: string
        }
        Insert: {
          cor?: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      spress_notificacoes: {
        Row: {
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean
          mensagem: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string
          destinatario_id?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      spress_paginas_site: {
        Row: {
          atualizado_por: string | null
          conteudo: Json
          created_at: string
          id: string
          slug: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          atualizado_por?: string | null
          conteudo?: Json
          created_at?: string
          id?: string
          slug: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          atualizado_por?: string | null
          conteudo?: Json
          created_at?: string
          id?: string
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_paginas_site_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "spress_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_pautas: {
        Row: {
          cliente_id: string
          created_at: string
          criado_por: string | null
          data_envio: string | null
          demanda_id: string | null
          id: string
          resumo: string | null
          status: string
          titulo: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          criado_por?: string | null
          data_envio?: string | null
          demanda_id?: string | null
          id?: string
          resumo?: string | null
          status?: string
          titulo: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          criado_por?: string | null
          data_envio?: string | null
          demanda_id?: string | null
          id?: string
          resumo?: string | null
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_pautas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_pautas_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_pautas_veiculos: {
        Row: {
          created_at: string
          id: string
          jornalista_id: string | null
          pauta_id: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jornalista_id?: string | null
          pauta_id: string
          veiculo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jornalista_id?: string | null
          pauta_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_pautas_veiculos_jornalista_id_fkey"
            columns: ["jornalista_id"]
            isOneToOne: false
            referencedRelation: "spress_jornalistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_pautas_veiculos_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "spress_pautas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_pautas_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "spress_veiculos_imprensa"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_publicacoes: {
        Row: {
          cliente_id: string
          conta_id: string | null
          created_at: string
          criado_por: string | null
          data_agendada: string | null
          demanda_id: string | null
          id: string
          legenda: string | null
          publicado_em: string | null
          status: string
          tipo_conteudo: string | null
          titulo: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          data_agendada?: string | null
          demanda_id?: string | null
          id?: string
          legenda?: string | null
          publicado_em?: string | null
          status?: string
          tipo_conteudo?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          data_agendada?: string | null
          demanda_id?: string | null
          id?: string
          legenda?: string | null
          publicado_em?: string | null
          status?: string
          tipo_conteudo?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_publicacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_publicacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "spress_redes_sociais_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_publicacoes_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "spress_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_publicacoes_midias: {
        Row: {
          created_at: string
          id: string
          ordem: number
          publicacao_id: string
          tipo: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          publicacao_id: string
          tipo?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          publicacao_id?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_publicacoes_midias_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: false
            referencedRelation: "spress_publicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_quadros: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          nome: string
          setor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          nome: string
          setor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          nome?: string
          setor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_quadros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spress_quadros_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "spress_setores"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_redes_sociais_contas: {
        Row: {
          cliente_id: string
          created_at: string
          handle: string | null
          id: string
          plataforma: string
          url: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          handle?: string | null
          id?: string
          plataforma: string
          url?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          handle?: string | null
          id?: string
          plataforma?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spress_redes_sociais_contas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "spress_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_setores: {
        Row: {
          acesso_financeiro: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          acesso_financeiro?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          acesso_financeiro?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      spress_usuarios: {
        Row: {
          ativo: boolean
          auth_user_id: string
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          role: string
          setor_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          auth_user_id: string
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          role?: string
          setor_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          auth_user_id?: string
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: string
          setor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spress_usuarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "spress_setores"
            referencedColumns: ["id"]
          },
        ]
      }
      spress_veiculos_imprensa: {
        Row: {
          abrangencia: string | null
          created_at: string
          id: string
          nome: string
          site: string | null
          tipo: string | null
        }
        Insert: {
          abrangencia?: string | null
          created_at?: string
          id?: string
          nome: string
          site?: string | null
          tipo?: string | null
        }
        Update: {
          abrangencia?: string | null
          created_at?: string
          id?: string
          nome?: string
          site?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      superadmin_profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      turma_pacote_historico: {
        Row: {
          created_at: string | null
          data_inicio: string
          id: string
          pacote_id: string | null
          turma_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_inicio: string
          id?: string
          pacote_id?: string | null
          turma_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_inicio?: string
          id?: string
          pacote_id?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turma_pacote_historico_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_pacote_historico_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ajuste_hora_aula: number | null
          ativo: boolean | null
          aulas_por_dia: number
          curso_id: string | null
          data_fim: string | null
          data_inicio: string | null
          data_inicio_cobranca: string | null
          deletado: boolean
          dias_semana: string[] | null
          hora_aula_prof_final: number | null
          hora_fim: string | null
          hora_fim_2: string | null
          hora_fim_3: string | null
          hora_inicio: string | null
          hora_inicio_2: string | null
          hora_inicio_3: string | null
          horario: string | null
          horarios_semana: Json | null
          id: string
          idioma_id: string | null
          jitsi_room_url: string | null
          materiais_lista: string[]
          nome: string
          observacoes: string | null
          observacoes_log: string | null
          pacote_id: string | null
          professor_id: string | null
          renovacao: number | null
          taxa_administrativa: number | null
          taxa_matricula: number | null
          turma_origem_id: string | null
          updated_at: string | null
          vagas_ocupadas: number | null
          vagas_total: number | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          ajuste_hora_aula?: number | null
          ativo?: boolean | null
          aulas_por_dia?: number
          curso_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_inicio_cobranca?: string | null
          deletado?: boolean
          dias_semana?: string[] | null
          hora_aula_prof_final?: number | null
          hora_fim?: string | null
          hora_fim_2?: string | null
          hora_fim_3?: string | null
          hora_inicio?: string | null
          hora_inicio_2?: string | null
          hora_inicio_3?: string | null
          horario?: string | null
          horarios_semana?: Json | null
          id?: string
          idioma_id?: string | null
          jitsi_room_url?: string | null
          materiais_lista?: string[]
          nome: string
          observacoes?: string | null
          observacoes_log?: string | null
          pacote_id?: string | null
          professor_id?: string | null
          renovacao?: number | null
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          turma_origem_id?: string | null
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_total?: number | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          ajuste_hora_aula?: number | null
          ativo?: boolean | null
          aulas_por_dia?: number
          curso_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_inicio_cobranca?: string | null
          deletado?: boolean
          dias_semana?: string[] | null
          hora_aula_prof_final?: number | null
          hora_fim?: string | null
          hora_fim_2?: string | null
          hora_fim_3?: string | null
          hora_inicio?: string | null
          hora_inicio_2?: string | null
          hora_inicio_3?: string | null
          horario?: string | null
          horarios_semana?: Json | null
          id?: string
          idioma_id?: string | null
          jitsi_room_url?: string | null
          materiais_lista?: string[]
          nome?: string
          observacoes?: string | null
          observacoes_log?: string | null
          pacote_id?: string | null
          professor_id?: string | null
          renovacao?: number | null
          taxa_administrativa?: number | null
          taxa_matricula?: number | null
          turma_origem_id?: string | null
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_total?: number | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_idioma_id_fkey"
            columns: ["idioma_id"]
            isOneToOne: false
            referencedRelation: "idiomas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_turma_origem_id_fkey"
            columns: ["turma_origem_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_system: {
        Row: {
          created_at: string
          sistema: string
          user_id: string
        }
        Insert: {
          created_at?: string
          sistema: string
          user_id: string
        }
        Update: {
          created_at?: string
          sistema?: string
          user_id?: string
        }
        Relationships: []
      }
      valor_pago_logs: {
        Row: {
          conta_id: string | null
          created_at: string | null
          data_mudanca: string | null
          id: string
          user_id: string | null
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          conta_id?: string | null
          created_at?: string | null
          data_mudanca?: string | null
          id?: string
          user_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          conta_id?: string | null
          created_at?: string | null
          data_mudanca?: string | null
          id?: string
          user_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valor_pago_logs_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_broadcasts: {
        Row: {
          contacts_count: number | null
          created_at: string | null
          id: string
          message: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          contacts_count?: number | null
          created_at?: string | null
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          contacts_count?: number | null
          created_at?: string | null
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      whatsapp_chats: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_chats_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          access_token: string
          business_account_id: string | null
          created_at: string
          id: string
          phone_number_id: string
          updated_at: string
        }
        Insert: {
          access_token: string
          business_account_id?: string | null
          created_at?: string
          id?: string
          phone_number_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          business_account_id?: string | null
          created_at?: string
          id?: string
          phone_number_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          curso: string | null
          id: string
          name: string | null
          phone: string
          turma_id: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          curso?: string | null
          id?: string
          name?: string | null
          phone: string
          turma_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          curso?: string | null
          id?: string
          name?: string | null
          phone?: string
          turma_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          chat_id: string | null
          contact_phone: string | null
          content: string | null
          created_at: string | null
          direction: string | null
          id: string
          message_type: string | null
          status: string | null
        }
        Insert: {
          chat_id?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          message_type?: string | null
          status?: string | null
        }
        Update: {
          chat_id?: string | null
          contact_phone?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          message_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_chats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_user_password: {
        Args: { new_password: string; user_email: string }
        Returns: undefined
      }
      decrement_parcelas_pagas: { Args: { mat_id: string }; Returns: undefined }
      delete_aula_unlocked: {
        Args: {
          p_data_aula: string
          p_numero_aula_manual?: number
          p_slot_horario?: number
          p_turma_id: string
        }
        Returns: undefined
      }
      fn_resolve_user_role: { Args: { p_email: string }; Returns: string }
      get_user_email: { Args: never; Returns: string }
      increment_parcelas_pagas: { Args: { mat_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_prof_for_class: { Args: { p_turma_id: string }; Returns: boolean }
      is_prof_for_student: { Args: { p_aluno_id: string }; Returns: boolean }
      is_student_in_class: { Args: { p_turma_id: string }; Returns: boolean }
      spress_cliente_ids: { Args: never; Returns: string[] }
      spress_is_admin: { Args: never; Returns: boolean }
      spress_is_financeiro: { Args: never; Returns: boolean }
      spress_is_member: { Args: never; Returns: boolean }
      spress_is_staff: { Args: never; Returns: boolean }
      spress_role: { Args: never; Returns: string }
      spress_setor_id: { Args: never; Returns: string }
      spress_usuario_id: { Args: never; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
