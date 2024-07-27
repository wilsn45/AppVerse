//
//  ContentView.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {
	@EnvironmentObject var riddleData: RiddleData
	@State private var navigate: Bool = false

    var body: some View {
		Grid(horizontalSpacing: 24, verticalSpacing: 24) {
			GridRow {
				OptionButton(type: .math) {
					navigate = true
					riddleData.riddleType = .math
					logCategorySelectEvent(type: .math)
				}
				OptionButton(type: .english) {
					navigate = true
					riddleData.riddleType = .english
					logCategorySelectEvent(type: .english)
				}
			}

			GridRow {
				OptionButton(type: .logical) {
					navigate = true
					riddleData.riddleType = .logical
					logCategorySelectEvent(type: .logical)
				}
				OptionButton(type: .crypto)  {
					navigate = true
					riddleData.riddleType = .crypto
					logCategorySelectEvent(type: .crypto)
				}
			}
		}
		.fullScreenCover(isPresented: $navigate) {
			TimerSelectionView()
		}
    }

	private func logCategorySelectEvent(type: RiddleType) {
		let event = Event(name: "home_category_clicked", category: .home, type: .click)
		Analytics.log(event: event, data: ["riddletype": type.title])
	}
}

//#Preview {
//	HomeView()
//        .modelContainer(for: Item.self, inMemory: true)
//}
