//
//  RiddleOptionsView.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 08/07/24.
//

import Foundation
import SwiftUI

struct RiddleOptionsView: View {
	let data: RiddleOptionData
	let action: ((Bool) -> Void)

	@State private var navigate: Bool = false

	var body: some View {
		Grid(horizontalSpacing: 24, verticalSpacing: 24) {
			GridRow {
				RiddleOptionButton(data: data.options[0] ) { id in
					lockAnswer(id: id)
				}
				RiddleOptionButton(data: data.options[1] ) { id in
					lockAnswer(id: id)
				}
			}

			GridRow {
				RiddleOptionButton(data: data.options[2] ) { id in
					lockAnswer(id: id)
				}
				RiddleOptionButton(data: data.options[3])  { id in
					lockAnswer(id: id)
				}
			}
		}
	}

	private func lockAnswer(id: String) {
		navigate = true
		let isTrue = id == data.correctOption
		action(isTrue)
	}

}
