
# --- !Ups

CREATE TABLE citizen (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    firstname varchar(255) NOT NULL,
    lastname varchar(255) NOT NULL,
    address varchar(255) NOT NULL,
    pesel varchar(11) NOT NULL,
	latlng varchar(255) NOT NULL,
	sigpoint boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE name_gender (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    gender varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

# --- !Downs
