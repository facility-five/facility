-- Plano gratuito
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users
) values (
  'Gratuito',
  'Ideal para condomínios pequenos',
  0,
  'month',
  1,  -- 1 administradora
  1,  -- 1 condomínio
  2,  -- 2 blocos
  20, -- 20 unidades
  50  -- 50 usuários
);

-- Plano Start (Mensal)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_reservas,
  has_visitantes,
  has_areas_comuns
) values (
  'Start',
  'Para condomínios que estão começando',
  4900, -- R$ 49,00
  'month',
  2,   -- 2 administradoras
  3,   -- 3 condomínios
  5,   -- 5 blocos
  100, -- 100 unidades
  200, -- 200 usuários
  true, -- reservas
  true, -- visitantes
  true  -- áreas comuns
);

-- Plano Start (Anual)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_reservas,
  has_visitantes,
  has_areas_comuns
) values (
  'Start Anual',
  'Para condomínios que estão começando',
  47900, -- R$ 479,00 (R$ 39,90/mês)
  'year',
  2,   -- 2 administradoras
  3,   -- 3 condomínios
  5,   -- 5 blocos
  100, -- 100 unidades
  200, -- 200 usuários
  true, -- reservas
  true, -- visitantes
  true  -- áreas comuns
);

-- Plano Pro (Mensal)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_reservas,
  has_visitantes,
  has_areas_comuns,
  has_documentos,
  has_funcionarios,
  has_assembleia,
  has_enquetes,
  has_ocorrencias,
  has_chamados,
  has_pets,
  has_veiculos
) values (
  'Pro',
  'Para condomínios que precisam de mais recursos',
  9900, -- R$ 99,00
  'month',
  5,    -- 5 administradoras
  10,   -- 10 condomínios
  20,   -- 20 blocos
  500,  -- 500 unidades
  1000, -- 1000 usuários
  true, -- reservas
  true, -- visitantes
  true, -- áreas comuns
  true, -- documentos
  true, -- funcionários
  true, -- assembleias
  true, -- enquetes
  true, -- ocorrências
  true, -- chamados
  true, -- pets
  true  -- veículos
);

-- Plano Pro (Anual)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_reservas,
  has_visitantes,
  has_areas_comuns,
  has_documentos,
  has_funcionarios,
  has_assembleia,
  has_enquetes,
  has_ocorrencias,
  has_chamados,
  has_pets,
  has_veiculos
) values (
  'Pro Anual',
  'Para condomínios que precisam de mais recursos',
  95900, -- R$ 959,00 (R$ 79,90/mês)
  'year',
  5,    -- 5 administradoras
  10,   -- 10 condomínios
  20,   -- 20 blocos
  500,  -- 500 unidades
  1000, -- 1000 usuários
  true, -- reservas
  true, -- visitantes
  true, -- áreas comuns
  true, -- documentos
  true, -- funcionários
  true, -- assembleias
  true, -- enquetes
  true, -- ocorrências
  true, -- chamados
  true, -- pets
  true  -- veículos
);

-- Plano Enterprise (Mensal)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_sindico,
  has_porteiro,
  has_reservas,
  has_visitantes,
  has_areas_comuns,
  has_documentos,
  has_funcionarios,
  has_assembleia,
  has_enquetes,
  has_ocorrencias,
  has_chamados,
  has_pets,
  has_veiculos,
  has_classificados
) values (
  'Enterprise',
  'Para administradoras e condomínios de grande porte',
  19900, -- R$ 199,00
  'month',
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  true, -- síndico
  true, -- porteiro
  true, -- reservas
  true, -- visitantes
  true, -- áreas comuns
  true, -- documentos
  true, -- funcionários
  true, -- assembleias
  true, -- enquetes
  true, -- ocorrências
  true, -- chamados
  true, -- pets
  true, -- veículos
  true  -- classificados
);

-- Plano Enterprise (Anual)
insert into plans (
  name,
  description,
  price,
  interval,
  max_administrators,
  max_condos,
  max_blocks,
  max_units,
  max_users,
  has_sindico,
  has_porteiro,
  has_reservas,
  has_visitantes,
  has_areas_comuns,
  has_documentos,
  has_funcionarios,
  has_assembleia,
  has_enquetes,
  has_ocorrencias,
  has_chamados,
  has_pets,
  has_veiculos,
  has_classificados
) values (
  'Enterprise Anual',
  'Para administradoras e condomínios de grande porte',
  191900, -- R$ 1.919,00 (R$ 159,90/mês)
  'year',
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  null, -- ilimitado
  true, -- síndico
  true, -- porteiro
  true, -- reservas
  true, -- visitantes
  true, -- áreas comuns
  true, -- documentos
  true, -- funcionários
  true, -- assembleias
  true, -- enquetes
  true, -- ocorrências
  true, -- chamados
  true, -- pets
  true, -- veículos
  true  -- classificados
);