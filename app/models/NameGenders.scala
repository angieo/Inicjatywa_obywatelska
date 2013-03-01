package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class NameGenders(id: Long, name: String, gender: String = "")

object NameGenders {
	
	val parser = {
		get[Long]("id") ~
		get[String]("name") map {
			case id~name => NameGenders(id, name)
		}
	}
	
	def getNames(term: String): List[NameGenders] = DB.withConnection { implicit connection =>
		SQL("select id, name from name_gender where name like {term} order by name asc").onParams("%"+term+"%").as(parser *)
	}
	
	def getGender(name: String): String = DB.withConnection { implicit connection =>
		val result =  SQL("select count(*) as c, gender from name_gender where name={name}").onParams(name).apply()
		var out = "Error"
		if(result.head[Long]("c") > 0)
			out = result.head[String]("gender")
		out
	}
	
	def rowCount: Long = DB.withConnection { implicit connection => 
		val firstrow = SQL("select count(*) as c from name_gender").apply().head
		firstrow[Long]("c")
	}
	
	def save(name: String, gender: String) = DB.withConnection { implicit connection =>
		SQL("insert into name_gender(name,gender) values ({iname},{igender})").on(
			"iname" -> name,
			"igender" -> gender
		).executeUpdate()
	}

	def checkSex(fname: String, sex: Int): Boolean = {
		val gendermatch: Boolean = getGender(fname) match {
			case "F" => sex%2==0
			case "M" => sex%2==1
			case _ => (fname takeRight 1) match {
				case "a" => sex%2==0
				case _ => true
			}
		}
		gendermatch
	}
}