//
//  EditNoteView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI

struct EditNoteView: View {
	let isNewNote: Bool

	var body: some View {
		HStack {
			Text("Your Note")
				.font(.headline)
			Spacer()
		}
		.navigationTitle(isNewNote ? "Write New Note": "Edit Note")
		.padding()
		.background(Color.gray.opacity(0.1))
		.cornerRadius(8)
	}
}
