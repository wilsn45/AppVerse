//
//  NotesView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import Foundation
import SwiftUI
import SwiftData


struct NotesView: View {

	@State var viewModel: NotesViewModel = NotesViewModel()
	@State var showConfirmationDialogue: Bool = false
	@State var showOverlay: Bool = false
	@State private var searchText = ""

	@State private var selectedNote: NoteEntity?

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
		VStack {
			// Add the search bar at the top
			VStack {
			  TextField("Search", text: $searchText)
					.padding(.horizontal)
			}
			.frame(maxHeight: 40)
			.background(Color(.systemGray5))
			.cornerRadius(4)
			.padding()

			ZStack {
				ScrollView() {
					ForEach(headers, id: \.self) { header in
						if let notes = groupedByDate[header] {
							NotesItemView(date: header, notes: notes)
								.padding(.vertical, 10)
						}
					}
				}.scrollIndicators(.hidden)

				NewItemView(action: {
					createNewNote()
					//EditNotesView(vm: $viewModel, note: selectedNote)
				})
			}
			.background(Color.backgroundGrey)
			.navigationTitle("Notes")
		}
	}

	// MARK: Core Data Operations

	private func createNewNote() {
		selectedNote = nil
		selectedNote = viewModel.createNote()
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


