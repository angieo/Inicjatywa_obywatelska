import play.api._
import scala.io._
import models.NameGenders

object Global extends GlobalSettings {

	val filepath = "app/datatofilldb/namelist.txt"
	
	override def onStart(app: Application) {
		if (NameGenders.rowCount == 0) {
			Source.fromFile(filepath).getLines.foreach { line => 
				val splitted = line.split(" ").map(_.toString)
				NameGenders.save(splitted(0), splitted(1))
			}
		}
	}
}