//
//  NotesView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import Foundation
import SwiftUI
import SwiftData
import Combine


struct NotesView: View {
	@EnvironmentObject var navigationManager: NavigationManager
	@State var viewModel: NotesViewModel = NotesViewModel()
	@State var showConfirmationDialogue: Bool = false
	@State var showOverlay: Bool = false
	@State private var searchText = ""
	private let searchPublisher = PassthroughSubject<String, Never>()

	@State var selectedNote: NoteEntity?
	@State private var reloadToggle = false

	init() {
		viewModel.fetchNotes()
	}

	var groupedByDate: [Date: [NoteEntity]] {
		let calendar = Calendar.current
		return Dictionary(grouping: viewModel.notes) { noteEntity in
			let dateComponents = calendar.dateComponents([.year, .month, .day], from: noteEntity.timestamp!)
			return calendar.date(from: dateComponents) ?? Date()
		}
	}

	var headers: [Date] {
		groupedByDate.map { $0.key }.sorted(by: { $0 > $1 })
	}

	var body: some View {
		ZStack {
			ScrollView() {
				ForEach(headers, id: \.self) { header in
					if let notes = groupedByDate[header] {
						NotesItemView(selectedNote: $selectedNote, date: header, notes: notes)
							.padding(.vertical, 10)

					}
				}
			}.scrollIndicators(.hidden)
				.id(reloadToggle)

			NewItemView(action: {
				createNewNote()
			})
		}
		.background(Color.backgroundGrey)
		.searchable(text: $searchText)
		.onChange(of: searchText) { newValue in
			searchPublisher.send(newValue)
		}
		.onReceive(searchPublisher) { newValue in
			viewModel.searchNotes(with: searchText)
		}
		.navigationDestination(for: NotesNavigation.self) { screen in
			EditNotesView(vm: $viewModel, note: selectedNote)
		}.onAppear {
			reloadToggle.toggle()
		}
	}

	// MARK: Core Data Operations

	private func createNewNote() {
		selectedNote = nil
		selectedNote = viewModel.createNote()
		navigationManager.path.append(NotesNavigation.newNote)
	}

	private func deleteNote(in header: Date, at offsets: IndexSet) {
		offsets.forEach { index in
			if let noteToDelete = groupedByDate[header]?[index] {

				if noteToDelete == selectedNote {
					selectedNote = nil
				}
				viewModel.deleteNote(noteToDelete)
			}
		}
	}
}

#Preview {
	NotesView()
}


enum NotesNavigation: Hashable {
	case editNote
	case newNote
}
