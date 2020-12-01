# NoteAPI
> A scalable & simple noteAPI built with Express.js that
> + supports CRUD operations & caching
> + is proxied & load balanced
> + managed with docker-compose
---

#### Employs
- Express.js  `| middleware`
- MonogDB     `| database`
- Redis       `| caching`
- Nginx       `| load balancing & reverse proxy`
- Docker      `| containerization`
---

#### Steps:
    docker-compose up -d
    docker-compose down 
---

#### Endpoints:
    /note
    GET    -> fetchRecordList
    POST   -> createRecord

    /note/<id>
    GET    -> fetchRecordDetails
    DELETE -> deleteRecord
    PUT    -> updateRecord

    * Accepts 2 parameters as input (JSON) for "createRecord" & "updateRecord"
        - note_title
        - note_body

#### Runs at port 8080 by default.