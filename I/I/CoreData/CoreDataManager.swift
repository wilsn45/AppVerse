//
//  CoreDataManager.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation

import CoreData

class CoreDataManager: ObservableObject {
	static let shared = CoreDataManager()
	private let persistentContainer: NSPersistentContainer

	private init() {
		persistentContainer = NSPersistentContainer(name: "iAppDataModel")
	}

	func loadContainer() {
		persistentContainer.loadPersistentStores { (description, error) in
			if let error = error {
				fatalError("Unable to load persistent stores: \(error)")
			}
		}
	}

	func fetchData<T: NSManagedObject>(entity: T.Type, predicate: NSPredicate? = nil) -> [T] {
		let context = persistentContainer.viewContext
		let fetchRequest = T.fetchRequest()
		fetchRequest.predicate = predicate

		do {
			let result = try context.fetch(fetchRequest) as! [T]
			return result
		} catch {
			print("Failed to fetch data: \(error)")
			return []
		}
	}

	func fetch<T>(_ request: NSFetchRequest<T>) throws -> [T] where T : NSFetchRequestResult {
		return try persistentContainer.viewContext.fetch(request)
	}


	func create<T: NSManagedObject>(type: T.Type) -> T {
		let newEntity = type.init(context: persistentContainer.viewContext)
		return newEntity
	}

	func saveContext() {
		let context = persistentContainer.viewContext
		if context.hasChanges {
			do {
				try context.save()
			} catch {
				let nserror = error as NSError
				fatalError("Unresolved error \(nserror), \(nserror.userInfo)")
			}
		}
	}

	func delete<T: NSManagedObject>(entity: T) {
		persistentContainer.viewContext.delete(entity)
	}
}
