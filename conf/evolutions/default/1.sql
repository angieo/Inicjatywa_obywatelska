
# --- !Ups

CREATE SEQUENCE citizen_id_seq;
CREATE TABLE citizen(id integer NOT NULL DEFAULT nextval('citizen_id_seq'), firstname varchar(255) NOT NULL, lastname varchar(255) NOT NULL, address varchar(255) NOT NULL, pesel varchar(11) NOT NULL, latlng varchar(255) NOT NULL, sigpoint boolean NOT NULL, PRIMARY KEY (id));

CREATE SEQUENCE name_gender_id_seq;
CREATE TABLE name_gender(id integer NOT NULL DEFAULT nextval('name_gender_id_seq'), name varchar(255) NOT NULL, gender varchar(255) NOT NULL, PRIMARY KEY (id)
);

# --- !Downs
