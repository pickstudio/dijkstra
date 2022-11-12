# Dijkstra server

# Project required

-   docker, docker-compose

# Getting started

### .env 준비

```bash
vi .env
```

`.env` 파일내용

```bash
FOO=bar
```

### local docker container환경 구성

```
# mysql 실행
docker-compose up --build -d
```

-   mysql은 localhost:23306 을 바라보면 됨

## 22-11-12 요구사항 정리

1. 로그인 처리(카카오&전화번호 vs. 전화번호 둘 중 하나 결정 필요)
2. 채팅 이어붙이기(우현님), (현재 단톡은 불가, 단톡 가능하도록 해야 함. 추후 채팅방에 주선자 초대하기 기능)(주선자를 모르는 상태에서 초대해서 공개 요청 & 동의)
3. 주선자 하나 껴 있는 4단계 sequence 개발
4. Image 올릴 수 있도록(S3?) 처리
5. 사용자 데이터 저장 DB 아키텍쳐 구성(주선자 분리)
6. 블랙리스트 기능
7. 나를 통해 연결된 사람 보기(주선자)
8. 공개 요청 기능
9. 나도 솔로 등록하기(솔로<-> 주선자 간 전환)
