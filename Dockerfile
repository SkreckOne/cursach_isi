# Этап сборки (Maven)
# Используем образ Maven с Eclipse Temurin Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Скачиваем зависимости
RUN mvn dependency:go-offline -B
COPY src ./src
# Собираем JAR
RUN mvn clean package -DskipTests

# Этап запуска (Java)
# Используем легкий Alpine-образ с JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]