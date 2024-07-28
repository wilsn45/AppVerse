//
//  NotesView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import Foundation
import SwiftUI
import SwiftData

enum NotesNavigationType: Hashable {
	case new
	case edit
}

struct NotesView: View {
	let NEW_NOTE = "NewNote"
	let EDIT_NOTE = "EditNote"
	let items = Array(1...100).map { "Item \($0)" }
	
	@EnvironmentObject var navigationModel: NavigationModel

	var body: some View {
		NavigationStack(path: $navigationModel.NotesPath)  {
			ZStack {
				let columns = [
					GridItem(.flexible()),
					GridItem(.flexible())
				]

				ScrollView {
					LazyVGrid(columns: columns, spacing: 16) {
						ForEach(items, id: \.self) { item in
							NotesItemView(item: item)
								.onTapGesture {
									navigationModel.NotesPath.append(.edit)
								}
						}
					}
					.padding(.horizontal)
				}

				NewItemView(action: {
					navigationModel.NotesPath.append(.new)
				})

			}
			.navigationTitle("Notes")
			.navigationDestination(for: NotesNavigationType.self) { view in
				navigationView(for: view)
			}
		}

	}

	private func navigationView(for type: NotesNavigationType) -> some View {
		let isNewNote = type ==  NotesNavigationType.new
		return EditNoteView(isNewNote: isNewNote)
	}
}

#Preview {
	NotesView()
}
