package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class User(firstname: String, lastname: String, address: String, latlng: String, pesel: String)
case class Address(address: String, latlng: String, distance: Float = 0)

object User {
	
	val parser = {
		get[String]("firstname") ~
		get[String]("lastname") ~
		get[String]("address") ~
		get[String]("latlng") ~
		get[String]("pesel") map {
			case f~l~a~ll~p => User(f, l, a, ll, p)
		}
	}
	
	def getUserData(id: Long): User = DB.withConnection { implicit connection => 
		SQL("select firstname, lastname, address, latlng, pesel from citizen where id = {id}").onParams(id).as(parser.single)
	}
	
	def getAddresses: List[(String,String)] = DB.withConnection { implicit connection =>
		SQL("select address, latlng from citizen where sigpoint = true")().map( row => row[String]("address") -> row[String]("latlng")).toList
	}
	
	def getAddressesAndDistances(ll: String): List[Address] = {
		val addr: List[(String,String)] = getAddresses
		val list: List[Address] = for(item <- addr) yield Address(item._1, item._2, calculateDistance(ll,item._2))
		list.sortBy(_.distance)
	}
	
	def save(fname: String, lname: String, adrs: String, latlng: String, psl: String, help: Boolean): Long = DB.withConnection { implicit connection =>
		SQL("insert into citizen(firstname, lastname, address, pesel, latlng, sigpoint) values ({fname}, {lname}, {adrs}, {psl}, {latlng}, {help})").on(
			"fname" -> fname,
			"lname" -> lname,
			"adrs" -> adrs,
			"psl" -> psl,
			"latlng" -> latlng,
			"help" -> help
		).executeInsert()
	} match {
        case Some(long) => long
        case None => throw new Exception(
            "SQL Error - Did not save User"
        )
    }
	
	private def calculateDistance(flatlng: String, slatlng: String): Float = {
		val latlng1 = flatlng.split(",").map(_.toFloat).toList
		val latlng2 = slatlng.split(",").map(_.toFloat).toList
		val rad = 6371 // Radius of the earth in km
		val dLat = math.toRadians(latlng2(0)-latlng1(0))
		val dLon = math.toRadians(latlng2(1)-latlng1(1))
		val a = math.sin(dLat/2) * math.sin(dLat/2) +
				math.cos(math.toRadians(latlng1(0))) * math.cos(math.toRadians(latlng2(0))) * 
				math.sin(dLon/2) * math.sin(dLon/2)
		val c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
			
		(rad * c).toFloat // Returns distance in km
	}
}