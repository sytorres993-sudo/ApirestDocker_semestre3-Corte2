FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/clientes-api-0.0.1-SNAPSHOT.jar app.jar
ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-Djava.net.preferIPv4Stack=true"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
