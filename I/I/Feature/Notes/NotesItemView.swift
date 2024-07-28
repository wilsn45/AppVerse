//
//  NotesItemView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import SwiftUI

struct NotesItemView: View {

	let note: NoteEntity

	var body: some View {
		HStack {
			Text(note.title ?? "New Note")
				.lineLimit(1)
				.font(.title3)
				.fontWeight(.bold)
			Text(note.content ?? "No context available")
				.lineLimit(1)
				.fontWeight(.light)
		}
		.padding()
		.background(Color.gray.opacity(0.1))
		.cornerRadius(8)
	}
}


#Preview {
	PasswordItemView(item: "Note A")
}
