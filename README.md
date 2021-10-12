# Etools PSEA App

TBD

## Install for development

- Part of `etools-infra`

  - `http://localhost:8082/psea/`
  - `docker-compose.dev.yml`:

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

  - `nginx.conf`:
    ```
       location /psea/ {
         proxy_pass http://psea:8080/;
       }
    ```

- requirements: `node`, `npm`, `polymer-cli`, `typescript`
- `npm install`

## Test app build locally

- Update `docker-compose.dev.yml` like this:

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
                  - ...
                  - psea_build
        ```
        ```
            psea_build:
                build:
                  context: ./psea
                  dockerfile: ./Dockerfile
                image: etoolsdev/etools-psea_build:dev
                container_name: etoolsinfra_psea_build
        ```

- `nginx.conf`:

        ```
           location /psea/ {
             proxy_pass http://psea_build:8080/psea/;
           }
        ```

#### TODO:

- Update page header element to use countries dropdown, profile menu and refresh data button
- Improve documentation
- Update tests
- Test build
