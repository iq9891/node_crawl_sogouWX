#Version: 1.0

FROM node:4.2.6

#设置root用户为后续命令的执行者
USER root

RUN apt-get update -y

RUN mkdir -p /data/adhoc_site

#设置工作目录
WORKDIR /data/adhoc_site

#拷贝代码到镜像
COPY . /data/adhoc_data_test

#设置sbt依赖库
RUN mkdir ~/.sbt && cp /data/adhoc_data_test/script/sbt-cn-repositories ~/.sbt/repositories

#增加sbt依赖库hostname到hosts；编译项目
RUN echo "192.168.1.2 nexus.appadhoc.com" >> /etc/hosts \
    && cd /data/adhoc_data_test && sbt clean assembly

CMD java -jar /data/adhoc_data_test/target/scala-2.10/adhoc_data_test-assembly-1.0.jar
