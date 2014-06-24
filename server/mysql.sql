DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id int(11) NOT NULL AUTO_INCREMENT,
  firstname varchar(45) DEFAULT NULL,
  lastname varchar(45) DEFAULT NULL,
  age varchar(45) DEFAULT NULL,
  country varchar(45) DEFAULT NULL,
  PRIMARY KEY (id)
);

insert into user (firstname, lastname, age, country) values ('thomas', 'davis', 20, 'usa');
