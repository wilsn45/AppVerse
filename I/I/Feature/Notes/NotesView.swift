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
	let NEW_NOTE = "NewNote"
	let EDIT_NOTE = "EditNote"
	let items = Array(1...100).map { "Item \($0)" }
	@EnvironmentObject var navigationModel: NavigationModel


	var body: some View {
		NavigationStack(path: $navigationModel.path)  {
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
									navigationModel.path.append(EDIT_NOTE)
								}
						}
					}
					.padding(.horizontal)
				}

				NewItemView(action: {
					navigationModel.path.append(NEW_NOTE)
				})

			}
			.navigationTitle("Notes")
			.navigationDestination(for: String.self) { view in
				navigationView(for: view)
			}
		}

	}

	private func navigationView(for type: String) -> some View {
		let isNewNote = type == NEW_NOTE
		return EditNoteView(isNewNote: isNewNote)
	}
}

#Preview {
	NotesView()
}
