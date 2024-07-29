//
//  NotesViewModel.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI
import CoreData

class NotesViewModel: ObservableObject {

	@Published var notes: [NoteEntity] = []
	@Published var isDataLoaded = false

	let dataManager = CoreDataManager.shared

	init() {
		fetchNotes()
	}

	func fetchNotes(with searchText: String = "")  {
		let request: NSFetchRequest<NoteEntity> = NoteEntity.fetchRequest()
		request.sortDescriptors = [NSSortDescriptor(key: "timestamp", ascending: false)]

		if !searchText.isEmpty {
			request.predicate = NSPredicate(format: "title CONTAINS %@", searchText)
		}

		do {
			notes = try dataManager.fetch(request).filter({  item in
				if let title = item.title, !title.isEmpty {
					return true
				}
				if let content = item.content, !content.isEmpty {
					return true
				}
				return false
			})
		} catch {
			print("Error fetching notes: \(error)")
		}

	}

	func createNote() -> NoteEntity {
		let newNote = dataManager.create(type: NoteEntity.self)
		newNote.id = UUID()
		newNote.timestamp = Date()
		dataManager.saveContext()
		fetchNotes() 
		return newNote
	}

	func deleteNote(_ note: NoteEntity) {
		dataManager.delete(entity: note)
		dataManager.saveContext()
		fetchNotes()
	}

	func updateNote(_ note: NoteEntity, title: String, content: String) {
		guard !title.isEmpty || !content.isEmpty else { return }
		note.title = title
		note.content = content
		dataManager.saveContext()
		fetchNotes()
	}

	func searchNotes(with searchText: String) {
		fetchNotes(with: searchText)
	}
}

