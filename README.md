# Dijkstra server

# Project required
- docker, docker-compose

# Getting started

### .env 준비

``` bash
vi .env
```
`.env` 파일내용 
``` bash
FOO=bar
```


### local docker container환경 구성
```
# mysql 실행
docker-compose up --build -d
```
- mysql은 localhost:23306 을 바라보면 됨