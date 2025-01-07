Para correr os containers basta ter o Docker instalado, ter o repositório intalado numa pasta local e correr no terminal (dentro da pasta do projeto) os seguintes comandos:
docker-compose down
docker-compose up --build -d

Considerações sobre o trabalho:
Para a backend e frontend optei por utilizar uma imagem de Node.js para fazer uma aplicação React.
Optei por utilizar uma RestAPI, pois para além de ser de fácil implementação, já tinha trabalhado anteriormente
Em relação à base de dados, comecei por usar a PostgreSQL, mas mudei para MongoDB, devido a uns problemas na conexão da backend com a db.
Tal como é pedido, apenas a base de dados tem um volume para guardar a informação da base de dados aquando da reiniciação dos containers.
Criei uma network "mynetwork" para a comunicação entre containers.
