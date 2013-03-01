package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json._
import play.api.libs.json.Json
import play.api.libs.functional.syntax._
import models.{User, NameGenders}

object Application extends Controller {
  
	val supForm = Form(
		tuple(
			"firstname" -> nonEmptyText,
			"lastname" -> nonEmptyText,
			"address" -> nonEmptyText,
			"latlng" -> nonEmptyText,
			"pesel" -> nonEmptyText
					.verifying("PESEL powinien składać się wyłącznie z cyfr", pesel => pesel.forall(_.isDigit))
					.verifying("PESEL powinien posiadać dokładnie 11 cyfr", pesel => pesel.length == 11),
			"help" -> boolean
		)
	)
	
	def index = Action { implicit request => 
		Ok(views.html.index("Proszę wypełnić poniższy formularz", supForm))
	}
	
	def save = Action { implicit request => 
		supForm.bindFromRequest.fold(
			errors => BadRequest(views.html.index("Wystąpiły błędy w formularzu. Proszę sprawdzić dane jeszcze raz", errors)),
			{ case (firstname, lastname, address, latlng, pesel, help) => 
				val listOfAddresses = User.getAddressesAndDistances(latlng)
				val id = User.save(firstname, lastname, address, latlng, pesel, help)
				Ok(views.html.save("Dziękujemy za wypełnienie formularza.", User.getUserData(id), listOfAddresses))
			}
		)
	}
  
	def nameJson = Action { implicit request =>
		val term = request.queryString.get("term").flatMap(_.headOption).getOrElse("")
		
		Ok(Json.toJson(NameGenders.getNames(term).map { t=>
			(t.id.toString, t.name)
		} toMap))
	}
  
	def nameGenderJson = Action { implicit request =>
		var fname = request.queryString.get("firstname").flatMap(_.headOption).getOrElse("")
		var pesel = request.queryString.get("pesel").flatMap(_.headOption).getOrElse("")
		var result: Boolean = (pesel.length < 11) match {
			case true => false 
			case false => pesel(9).toString match {
				case x: String => if(fname == "") true else NameGenders.checkSex(fname, pesel(9).toString.toInt)
				case _ => false
			}
		}
		Ok(Json.toJson(result))
	}
	
	def javascriptRoutes = Action { implicit request =>
		import routes.javascript._
		
		Ok(Routes.javascriptRouter("jsRoutes")(
			routes.javascript.Application.nameJson,
			routes.javascript.Application.nameGenderJson
		)).as("text/javascript")
	}
}