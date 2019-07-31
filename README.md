# Etools PSEA App

TBD

## Install
* Part of `etools-infra`
    * `http://localhost:8082/psea/`
    * `docker-compose.dev.yml`:
        ```
            proxy:
                build:
                  context: ./proxy
                  dockerfile: ./Dockerfile
                image: etoolsdev/etools-proxy:dev
                container_name: etoolsinfra_proxy
                ports:
                  - "8082:80"
                depends_on:
                  - backend
                  - pmp
                  - ...
                  - psea
        ```
        ```
            psea:
               build:
                 context: ./psea
                 dockerfile: ./Dockerfile-dev
               image: etoolsdev/etools-psea:dev
               container_name: etoolsinfra_psea
               volumes:
                 - "./psea:/code"
               command: ${FE_COMMAND:-sh -c "npm run start"}
        ```
    * `nginx.conf`:
        ```
           location /psea/ {
             proxy_pass http://psea:8080/;
           }
        ```
* requirements: `node`, `npm`, `polymer-cli`, `typescript`, `gulp`
* `npm install`

#### TODO: 
* Update page header element to use countries dropdown, profile menu and refresh data button
* Improve documentation
* Update tests
* Test build
