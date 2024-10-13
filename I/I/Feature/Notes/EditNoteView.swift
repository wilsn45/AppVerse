//
//  EditNoteView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI
import Combine

struct EditNotesView: View {

	@Binding var vm: NotesViewModel
	@State var note: NoteEntity?
	@State private var title: String = ""
	@State private var content: String = ""

	private let titlePublisher = PassthroughSubject<String, Never>()
	@EnvironmentObject var navigationManager: NavigationManager

	@FocusState private var contentEditorInFocus: Bool

	var body: some View {

		Button("Back") {
			self.hideKeyboard()
			self.updateNote(title: title, content: content)
			DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
				self.navigationManager.path.removeLast()
			}

		}

		ScrollView {
			VStack(alignment: .leading, spacing: 20) {

				TextField("Title", text: $title, axis: .vertical)
					.font(.title.bold())
					.submitLabel(.next)
					.onChange(of: title) { newValue in
						titlePublisher.send(newValue)
					}
					.onReceive(titlePublisher) { newValue in
						guard let newValueLastChar = newValue.last else { return }
						if newValueLastChar == "\n" {
							title.removeLast()
							contentEditorInFocus = true
						}
					}

				TextEditorView(string: $content)
					.scrollDisabled(true)
					.font(.title3)
					.focused($contentEditorInFocus)


			}
			.padding(10)
		}
		.navigationBarTitleDisplayMode(.inline)
		.toolbar {
			ToolbarItem(placement: .keyboard) {
				HStack {
					Spacer()
					Button("Done") {
						self.hideKeyboard()
						self.updateNote(title: title, content: content)
					}
				}
			}
		}
		.onAppear {
			if let note = note {
				self.title = note.title ?? ""
				self.content = note.content ?? ""
			}
		}.onDisappear {
			self.updateNote(title: title, content: content)
		}

	}

	// MARK: Core Data Operations

	func updateNote(title: String, content: String) {
		guard let note = note else { return }
		vm.updateNote(note, title: title, content: content)
	}
}
