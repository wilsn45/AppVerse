//
//  NotesItemView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import SwiftUI

struct NotesItemView: View {
	@EnvironmentObject var navigationManager: NavigationManager
	@Binding var selectedNote: NoteEntity?
	let date: Date
	let notes: [NoteEntity]

	var body: some View {
		VStack(alignment: .leading) {
			Text(date, style: .date)
				.background(AppColor.backgroundGrey)

			let columns = [
				GridItem(.flexible()),
				GridItem(.flexible())
			]

			LazyVGrid(columns: columns, spacing: 16) {
				ForEach(notes, id: \.self) { item in
					ListCellView(note: item)
						.onTapGesture {
							selectedNote = item
							navigationManager.path.append(NotesNavigation.editNote)
						}
				}
			}
		}
		.padding()
		.cornerRadius(8)
	}
}



struct ListCellView: View {
	var note: NoteEntity

	var body: some View {
		VStack() {
			Text(note.title ?? "")
			Text(note.content ?? "")
		}
		.padding()
		.background(AppColor.backgroundWhite)
		.clipShape(RoundedRectangle(cornerRadius: 15))
		.shadow(color: AppColor.borderGrey, radius: 10, x: 0, y: 5)
	}
}
